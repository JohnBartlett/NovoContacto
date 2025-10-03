import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { contactId, version, restoreAll, date } = await request.json()

    if (restoreAll && date) {
      // Restore all contacts to a specific date
      const targetDate = new Date(date)
      
      // Get all contacts that were active at that date
      const contactsToRestore = await prisma.contact.findMany({
        where: {
          isActive: true,
          createdAt: {
            lte: targetDate
          }
        },
        include: {
          versions: {
            where: {
              createdAt: {
                lte: targetDate
              }
            },
            orderBy: { version: 'desc' },
            take: 1
          }
        }
      })

      // Restore each contact to its latest version before the target date
      for (const contact of contactsToRestore) {
        if (contact.versions.length > 0) {
          const versionToRestore = contact.versions[0]
          
          // Create new version snapshot
          await prisma.contactVersion.create({
            data: {
              contactId: contact.id,
              version: contact.version + 1,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              address: contact.address,
              notes: contact.notes,
            }
          })

          // Restore to the target version
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              name: versionToRestore.name,
              email: versionToRestore.email,
              phone: versionToRestore.phone,
              address: versionToRestore.address,
              notes: versionToRestore.notes,
              version: contact.version + 1,
              updatedAt: new Date()
            }
          })
        }
      }

      return NextResponse.json({ 
        success: true, 
        restored: contactsToRestore.length 
      })

    } else if (contactId && version) {
      // Restore specific contact to specific version
      const versionData = await prisma.contactVersion.findFirst({
        where: {
          contactId,
          version: parseInt(version)
        }
      })

      if (!versionData) {
        return NextResponse.json({ 
          error: 'Version not found' 
        }, { status: 404 })
      }

      const contact = await prisma.contact.findUnique({
        where: { id: contactId }
      })

      if (!contact) {
        return NextResponse.json({ 
          error: 'Contact not found' 
        }, { status: 404 })
      }

      // Create version snapshot before restore
      await prisma.contactVersion.create({
        data: {
          contactId,
          version: contact.version + 1,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          notes: contact.notes,
        }
      })

      // Restore to the target version
      const restoredContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          name: versionData.name,
          email: versionData.email,
          phone: versionData.phone,
          address: versionData.address,
          notes: versionData.notes,
          version: contact.version + 1,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({ 
        success: true, 
        contact: restoredContact 
      })

    } else {
      return NextResponse.json({ 
        error: 'Invalid restore parameters' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json({ 
      error: 'Restore failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

