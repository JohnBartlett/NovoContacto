import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 })
    }

    const contacts = parseResult.data as any[]
    
    // Log the first contact to see what fields are available
    if (contacts.length > 0) {
      console.log('Sample contact fields:', Object.keys(contacts[0]))
      console.log('Sample contact data:', contacts[0])
    }
    
    // Create upload record
    const upload = await prisma.contactUpload.create({
      data: {
        filename: file.name,
        totalContacts: contacts.length,
        status: 'processing',
      }
    })

    // Process contacts in batches
    const batchSize = 100
    let processedCount = 0
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      
      const contactData = batch.map(contact => {
        // Map Google Contacts fields to our schema
        const firstName = contact['First Name'] || ''
        const lastName = contact['Last Name'] || ''
        const name = firstName && lastName ? `${firstName} ${lastName}`.trim() : (firstName || lastName || null)
        
        const email = contact['E-mail 1 - Value'] || contact['E-mail 2 - Value'] || contact['E-mail 3 - Value'] || null
        const phone = contact['Phone 1 - Value'] || contact['Phone 2 - Value'] || contact['Phone 3 - Value'] || null
        const address = contact['Address 1 - Formatted'] || contact['Address 1 - Street'] || null
        const notes = contact['Notes'] || null
        
        return {
          name,
          email,
          phone,
          address,
          notes,
          version: 1
        }
      })

      // Create contacts one by one to handle the upload relationship
      for (const contact of contactData) {
        await prisma.contact.create({
          data: {
            ...contact,
            uploadId: upload.id
          }
        })
      }

      processedCount += batch.length
      
      // Update progress
      await prisma.contactUpload.update({
        where: { id: upload.id },
        data: { processedContacts: processedCount }
      })
    }

    // Mark upload as completed
    await prisma.contactUpload.update({
      where: { id: upload.id },
      data: { status: 'completed' }
    })

    return NextResponse.json({ 
      success: true, 
      uploadId: upload.id,
      totalContacts: contacts.length 
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed'
    if (error instanceof Error) {
      if (error.message.includes('Unknown argument')) {
        errorMessage = 'Database configuration error. Please try again.'
      } else if (error.message.includes('CSV')) {
        errorMessage = 'Invalid CSV format. Please ensure it\'s a valid Google Contacts export.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
