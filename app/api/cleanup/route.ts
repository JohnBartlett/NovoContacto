import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    let results = {
      cleaned: 0,
      errors: 0,
      details: [] as string[]
    }

    switch (action) {
      case 'address-cleanup':
        results = await cleanupAddresses()
        break
      case 'empty-fields':
        results = await cleanupEmptyFields()
        break
      case 'duplicates':
        results = await cleanupDuplicates()
        break
      case 'general':
        results = await generalCleanup()
        break
      default:
        return NextResponse.json({ error: 'Invalid cleanup action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Failed to perform cleanup' 
    }, { status: 500 })
  }
}

async function cleanupAddresses() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts with malformed addresses
    const contacts = await prisma.contact.findMany({
      where: {
        address: {
          contains: '0D=0A'
        }
      }
    })

    for (const contact of contacts) {
      try {
        // Clean up escape sequences and malformed data
        let cleanedAddress = contact.address
          ?.replace(/0D=0A/g, '\n') // Convert escape sequences to newlines
          ?.replace(/:::/g, '\n') // Replace separators with newlines
          ?.replace(/\n+/g, '\n') // Remove multiple consecutive newlines
          ?.trim()

        // Remove duplicate lines
        if (cleanedAddress) {
          const lines = cleanedAddress.split('\n')
          const uniqueLines = [...new Set(lines)]
          cleanedAddress = uniqueLines.join('\n')
        }

        await prisma.contact.update({
          where: { id: contact.id },
          data: { address: cleanedAddress }
        })

        results.cleaned++
        results.details.push(`Cleaned address for contact ${contact.id}`)
      } catch (error) {
        results.errors++
        results.details.push(`Error cleaning contact ${contact.id}: ${error}`)
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during address cleanup: ${error}`)
  }

  return results
}

async function cleanupEmptyFields() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts with empty names or emails
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { name: null },
          { name: '' },
          { email: null },
          { email: '' }
        ]
      }
    })

    for (const contact of contacts) {
      try {
        // Try to extract name from email if available
        let cleanedName = contact.name
        let cleanedEmail = contact.email

        if (!cleanedName && cleanedEmail) {
          // Extract name from email (e.g., "john.doe@example.com" -> "John Doe")
          const emailName = cleanedEmail.split('@')[0]
          cleanedName = emailName
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ')
        }

        if (!cleanedEmail && cleanedName) {
          // Generate placeholder email
          cleanedEmail = `${cleanedName.toLowerCase().replace(/\s+/g, '.')}@example.com`
        }

        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            name: cleanedName || 'Unknown Contact',
            email: cleanedEmail || null
          }
        })

        results.cleaned++
        results.details.push(`Cleaned empty fields for contact ${contact.id}`)
      } catch (error) {
        results.errors++
        results.details.push(`Error cleaning contact ${contact.id}: ${error}`)
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during empty fields cleanup: ${error}`)
  }

  return results
}

async function cleanupDuplicates() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find potential duplicates based on email
    const contacts = await prisma.contact.findMany({
      where: {
        email: { not: null }
      },
      orderBy: { createdAt: 'asc' }
    })

    const emailGroups = new Map<string, any[]>()

    // Group by email
    for (const contact of contacts) {
      if (contact.email) {
        const normalizedEmail = contact.email.toLowerCase().trim()
        if (!emailGroups.has(normalizedEmail)) {
          emailGroups.set(normalizedEmail, [])
        }
        emailGroups.get(normalizedEmail)!.push(contact)
      }
    }

    // Remove duplicates (keep the oldest)
    for (const [email, group] of emailGroups) {
      if (group.length > 1) {
        // Keep the first (oldest) contact, delete the rest
        const toDelete = group.slice(1)
        
        for (const duplicate of toDelete) {
          try {
            await prisma.contact.update({
              where: { id: duplicate.id },
              data: { isActive: false }
            })
            results.cleaned++
            results.details.push(`Removed duplicate contact ${duplicate.id} (email: ${email})`)
          } catch (error) {
            results.errors++
            results.details.push(`Error removing duplicate ${duplicate.id}: ${error}`)
          }
        }
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during duplicate cleanup: ${error}`)
  }

  return results
}

async function generalCleanup() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Run all cleanup routines
    const addressResults = await cleanupAddresses()
    const emptyResults = await cleanupEmptyFields()
    const duplicateResults = await cleanupDuplicates()

    results.cleaned = addressResults.cleaned + emptyResults.cleaned + duplicateResults.cleaned
    results.errors = addressResults.errors + emptyResults.errors + duplicateResults.errors
    results.details = [
      ...addressResults.details,
      ...emptyResults.details,
      ...duplicateResults.details
    ]

    // Additional general cleanup
    const contacts = await prisma.contact.findMany({
      where: { isActive: true }
    })

    for (const contact of contacts) {
      try {
        let needsUpdate = false
        const updateData: any = {}

        // Clean up phone numbers
        if (contact.phone) {
          const cleanedPhone = contact.phone
            .replace(/[^\d+\-\(\)\s]/g, '') // Remove non-phone characters
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
          
          if (cleanedPhone !== contact.phone) {
            updateData.phone = cleanedPhone
            needsUpdate = true
          }
        }

        // Clean up names
        if (contact.name) {
          const cleanedName = contact.name
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim()
          
          if (cleanedName !== contact.name) {
            updateData.name = cleanedName
            needsUpdate = true
          }
        }

        // Clean up emails
        if (contact.email) {
          const cleanedEmail = contact.email
            .toLowerCase()
            .trim()
          
          if (cleanedEmail !== contact.email) {
            updateData.email = cleanedEmail
            needsUpdate = true
          }
        }

        if (needsUpdate) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: updateData
          })
          results.cleaned++
          results.details.push(`General cleanup for contact ${contact.id}`)
        }

      } catch (error) {
        results.errors++
        results.details.push(`Error in general cleanup for contact ${contact.id}: ${error}`)
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during general cleanup: ${error}`)
  }

  return results
}
