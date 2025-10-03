import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        },
        upload: true
      }
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json(contact)

  } catch (error) {
    console.error('Contact fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contact' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json()
    console.log('API: Received update data:', updateData)
    console.log('API: Contact ID:', params.id)

    // Get current contact
    const currentContact = await prisma.contact.findUnique({
      where: { id: params.id }
    })

    if (!currentContact) {
      console.log('API: Contact not found')
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    console.log('API: Current contact:', currentContact)

    // Create version snapshot before update
    try {
      await prisma.contactVersion.create({
        data: {
          contactId: params.id,
          version: currentContact.version,
          name: currentContact.name,
          email: currentContact.email,
          phone: currentContact.phone,
          address: currentContact.address,
          notes: currentContact.notes,
        }
      })
      console.log('API: Version snapshot created successfully')
    } catch (versionError) {
      console.error('API: Version creation failed:', versionError)
      // Continue with update even if version creation fails
    }

    console.log('API: Created version snapshot')

    // Filter out fields that shouldn't be updated
    const allowedFields = ['name', 'email', 'phone', 'address', 'notes']
    const filteredUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key]
        return obj
      }, {} as any)
    
    // Update contact with new version
    const updateDataWithVersion = {
      ...filteredUpdateData,
      version: currentContact.version + 1,
      updatedAt: new Date()
    }
    
    console.log('API: Filtered update data:', filteredUpdateData)
    console.log('API: Update data with version:', updateDataWithVersion)
    
    const updatedContact = await prisma.contact.update({
      where: { id: params.id },
      data: updateDataWithVersion
    })

    console.log('API: Updated contact:', updatedContact)

    return NextResponse.json(updatedContact)

  } catch (error) {
    console.error('Contact update error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Failed to update contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by setting isActive to false
    await prisma.contact.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Contact delete error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete contact' 
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'restore') {
      // Restore contact by setting isActive back to true
      const restoredContact = await prisma.contact.update({
        where: { id: params.id },
        data: { isActive: true }
      })
      
      return NextResponse.json(restoredContact)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Contact restore error:', error)
    return NextResponse.json({ 
      error: 'Failed to restore contact' 
    }, { status: 500 })
  }
}
