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
      case 'useless-contacts':
        results = await cleanupUselessContacts()
        break
      case 'invalid-emails':
        results = await cleanupInvalidEmails()
        break
      case 'test-data':
        results = await cleanupTestData()
        break
      case 'data-validation':
        results = await cleanupDataValidation()
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

async function cleanupUselessContacts() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts that are likely useless
    const uselessPatterns = [
      // Test data patterns
      { pattern: /^test/i, field: 'name' },
      { pattern: /^example/i, field: 'name' },
      { pattern: /^sample/i, field: 'name' },
      { pattern: /^demo/i, field: 'name' },
      { pattern: /^dummy/i, field: 'name' },
      { pattern: /^fake/i, field: 'name' },
      { pattern: /^temp/i, field: 'name' },
      { pattern: /^tmp/i, field: 'name' },
      
      // Generic/placeholder names
      { pattern: /^john\s+doe/i, field: 'name' },
      { pattern: /^jane\s+doe/i, field: 'name' },
      { pattern: /^user\s*\d*$/i, field: 'name' },
      { pattern: /^admin$/i, field: 'name' },
      { pattern: /^root$/i, field: 'name' },
      { pattern: /^guest$/i, field: 'name' },
      { pattern: /^anonymous$/i, field: 'name' },
      
      // Single character or very short names
      { pattern: /^[a-z]$/i, field: 'name' },
      { pattern: /^[a-z]{2}$/i, field: 'name' },
      
      // Email patterns that suggest test data
      { pattern: /@example\.com$/i, field: 'email' },
      { pattern: /@test\.com$/i, field: 'email' },
      { pattern: /@demo\.com$/i, field: 'email' },
      { pattern: /@sample\.com$/i, field: 'email' },
      { pattern: /@localhost$/i, field: 'email' },
      { pattern: /@127\.0\.0\.1$/i, field: 'email' },
      { pattern: /@dummy\.com$/i, field: 'email' },
      { pattern: /@fake\.com$/i, field: 'email' },
      
      // Phone patterns that suggest test data
      { pattern: /^123-456-7890$/i, field: 'phone' },
      { pattern: /^000-000-0000$/i, field: 'phone' },
      { pattern: /^111-111-1111$/i, field: 'phone' },
      { pattern: /^555-555-5555$/i, field: 'phone' },
      { pattern: /^999-999-9999$/i, field: 'phone' },
      
      // Address patterns that suggest test data
      { pattern: /^123\s+test\s+street/i, field: 'address' },
      { pattern: /^123\s+main\s+street/i, field: 'address' },
      { pattern: /^123\s+example\s+street/i, field: 'address' },
      { pattern: /^123\s+demo\s+street/i, field: 'address' },
      { pattern: /^test\s+address/i, field: 'address' },
      { pattern: /^example\s+address/i, field: 'address' },
      { pattern: /^demo\s+address/i, field: 'address' },
      { pattern: /^sample\s+address/i, field: 'address' }
    ]

    for (const pattern of uselessPatterns) {
      const whereClause: any = { isActive: true }
      whereClause[pattern.field] = { contains: pattern.pattern.source }

      const contacts = await prisma.contact.findMany({ where: whereClause })

      for (const contact of contacts) {
        try {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { isActive: false }
          })
          results.cleaned++
          results.details.push(`Removed useless contact: ${contact.name || 'Unknown'} (${pattern.field}: ${contact[pattern.field as keyof typeof contact]})`)
        } catch (error) {
          results.errors++
          results.details.push(`Error removing useless contact ${contact.id}: ${error}`)
        }
      }
    }

    // Find contacts with only generic data
    const genericContacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { in: ['John', 'Jane', 'User', 'Admin', 'Test', 'Demo', 'Sample'] } },
          { email: { contains: 'noreply' } },
          { email: { contains: 'no-reply' } },
          { email: { contains: 'donotreply' } },
          { email: { contains: 'do-not-reply' } }
        ]
      }
    })

    for (const contact of genericContacts) {
      try {
        await prisma.contact.update({
          where: { id: contact.id },
          data: { isActive: false }
        })
        results.cleaned++
        results.details.push(`Removed generic contact: ${contact.name || 'Unknown'} (${contact.email || 'No email'})`)
      } catch (error) {
        results.errors++
        results.details.push(`Error removing generic contact ${contact.id}: ${error}`)
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during useless contacts cleanup: ${error}`)
  }

  return results
}

async function cleanupInvalidEmails() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts with invalid email patterns
    const invalidEmailPatterns = [
      /^[^@]+$/, // No @ symbol
      /@$/, // Ends with @
      /^@/, // Starts with @
      /@.*@/, // Multiple @ symbols
      /\.{2,}/, // Multiple consecutive dots
      /^\./, // Starts with dot
      /\.$/, // Ends with dot
      /@\./, // @ followed by dot
      /\.@/, // Dot followed by @
      /[^a-zA-Z0-9@._-]/, // Invalid characters
      /^.{1,2}@/, // Too short before @
      /@.{1,2}$/, // Too short after @
      /\.{3,}/, // Too many consecutive dots
      /^.{256,}$/, // Too long
      /@.{256,}$/, // Domain too long
      /^.{256,}@/ // Local part too long
    ]

    const contacts = await prisma.contact.findMany({
      where: {
        isActive: true,
        email: { not: null }
      }
    })

    for (const contact of contacts) {
      if (contact.email) {
        let isInvalid = false
        let reason = ''

        for (const pattern of invalidEmailPatterns) {
          if (pattern.test(contact.email)) {
            isInvalid = true
            reason = `Invalid email pattern: ${pattern.source}`
            break
          }
        }

        // Additional validation
        if (!isInvalid) {
          const emailParts = contact.email.split('@')
          if (emailParts.length !== 2) {
            isInvalid = true
            reason = 'Invalid email format'
          } else {
            const [local, domain] = emailParts
            if (local.length === 0 || domain.length === 0) {
              isInvalid = true
              reason = 'Empty local or domain part'
            } else if (!domain.includes('.')) {
              isInvalid = true
              reason = 'Domain missing TLD'
            }
          }
        }

        if (isInvalid) {
          try {
            await prisma.contact.update({
              where: { id: contact.id },
              data: { isActive: false }
            })
            results.cleaned++
            results.details.push(`Removed contact with invalid email: ${contact.name || 'Unknown'} (${contact.email}) - ${reason}`)
          } catch (error) {
            results.errors++
            results.details.push(`Error removing contact with invalid email ${contact.id}: ${error}`)
          }
        }
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during invalid emails cleanup: ${error}`)
  }

  return results
}

async function cleanupTestData() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts that are clearly test data
    const testDataPatterns = [
      // Common test email domains
      { domain: 'example.com', reason: 'Example domain' },
      { domain: 'test.com', reason: 'Test domain' },
      { domain: 'demo.com', reason: 'Demo domain' },
      { domain: 'sample.com', reason: 'Sample domain' },
      { domain: 'localhost', reason: 'Localhost domain' },
      { domain: '127.0.0.1', reason: 'Local IP domain' },
      { domain: 'dummy.com', reason: 'Dummy domain' },
      { domain: 'fake.com', reason: 'Fake domain' },
      { domain: 'temp.com', reason: 'Temporary domain' },
      { domain: 'tmp.com', reason: 'Temporary domain' },
      
      // Common test email patterns
      { pattern: /^test\d*@/, reason: 'Test email pattern' },
      { pattern: /^demo\d*@/, reason: 'Demo email pattern' },
      { pattern: /^sample\d*@/, reason: 'Sample email pattern' },
      { pattern: /^example\d*@/, reason: 'Example email pattern' },
      { pattern: /^user\d*@/, reason: 'User email pattern' },
      { pattern: /^admin\d*@/, reason: 'Admin email pattern' },
      { pattern: /^guest\d*@/, reason: 'Guest email pattern' },
      { pattern: /^temp\d*@/, reason: 'Temporary email pattern' },
      { pattern: /^tmp\d*@/, reason: 'Temporary email pattern' }
    ]

    for (const testPattern of testDataPatterns) {
      let whereClause: any = { isActive: true }

      if ('domain' in testPattern) {
        whereClause.email = { contains: `@${testPattern.domain}` }
      } else if ('pattern' in testPattern) {
        whereClause.email = { regex: testPattern.pattern.source }
      }

      const contacts = await prisma.contact.findMany({ where: whereClause })

      for (const contact of contacts) {
        try {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { isActive: false }
          })
          results.cleaned++
          const reason = 'domain' in testPattern ? testPattern.reason : testPattern.reason
          results.details.push(`Removed test data contact: ${contact.name || 'Unknown'} (${contact.email}) - ${reason}`)
        } catch (error) {
          results.errors++
          results.details.push(`Error removing test data contact ${contact.id}: ${error}`)
        }
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during test data cleanup: ${error}`)
  }

  return results
}

async function cleanupDataValidation() {
  const results = {
    cleaned: 0,
    errors: 0,
    details: [] as string[]
  }

  try {
    // Find contacts with data validation issues
    const contacts = await prisma.contact.findMany({
      where: { isActive: true }
    })

    for (const contact of contacts) {
      let needsUpdate = false
      const updateData: any = {}

      // Clean up names
      if (contact.name) {
        let cleanedName = contact.name
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
          .replace(/[^\w\s.-]/g, '') // Remove special characters except basic ones
        
        if (cleanedName !== contact.name) {
          updateData.name = cleanedName
          needsUpdate = true
        }
      }

      // Clean up phone numbers
      if (contact.phone) {
        let cleanedPhone = contact.phone
          .replace(/[^\d+\-\(\)\s]/g, '') // Keep only valid phone characters
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim()
        
        if (cleanedPhone !== contact.phone) {
          updateData.phone = cleanedPhone
          needsUpdate = true
        }
      }

      // Clean up emails
      if (contact.email) {
        let cleanedEmail = contact.email
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '') // Remove spaces
        
        if (cleanedEmail !== contact.email) {
          updateData.email = cleanedEmail
          needsUpdate = true
        }
      }

      // Clean up addresses
      if (contact.address) {
        let cleanedAddress = contact.address
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
          .replace(/\n\s*\n/g, '\n') // Multiple newlines to single newline
        
        if (cleanedAddress !== contact.address) {
          updateData.address = cleanedAddress
          needsUpdate = true
        }
      }

      // Clean up notes
      if (contact.notes) {
        let cleanedNotes = contact.notes
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
        
        if (cleanedNotes !== contact.notes) {
          updateData.notes = cleanedNotes
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        try {
          await prisma.contact.update({
            where: { id: contact.id },
            data: updateData
          })
          results.cleaned++
          results.details.push(`Validated and cleaned contact: ${contact.name || 'Unknown'}`)
        } catch (error) {
          results.errors++
          results.details.push(`Error validating contact ${contact.id}: ${error}`)
        }
      }
    }

  } catch (error) {
    results.errors++
    results.details.push(`Error during data validation cleanup: ${error}`)
  }

  return results
}
