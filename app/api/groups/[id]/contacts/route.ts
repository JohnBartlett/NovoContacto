import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { contactIds } = await request.json()

    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json({ error: 'Contact IDs array is required' }, { status: 400 })
    }

    // Add contacts to group
    const contactGroups = await Promise.all(
      contactIds.map(contactId =>
        prisma.contactGroup.upsert({
          where: {
            contactId_groupId: {
              contactId,
              groupId: params.id
            }
          },
          update: {},
          create: {
            contactId,
            groupId: params.id
          }
        })
      )
    )

    return NextResponse.json({ success: true, added: contactGroups.length })
  } catch (error) {
    console.error('Failed to add contacts to group:', error)
    return NextResponse.json({ error: 'Failed to add contacts to group' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { contactIds } = await request.json()

    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json({ error: 'Contact IDs array is required' }, { status: 400 })
    }

    // Remove contacts from group
    await prisma.contactGroup.deleteMany({
      where: {
        groupId: params.id,
        contactId: {
          in: contactIds
        }
      }
    })

    return NextResponse.json({ success: true, removed: contactIds.length })
  } catch (error) {
    console.error('Failed to remove contacts from group:', error)
    return NextResponse.json({ error: 'Failed to remove contacts from group' }, { status: 500 })
  }
}
