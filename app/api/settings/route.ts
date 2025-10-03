import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    let settings = await prisma.displaySettings.findUnique({
      where: { userId: 'default' }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.displaySettings.create({
        data: {
          userId: 'default',
          showName: true,
          showEmail: true,
          showPhone: true,
          showAddress: true,
          showNotes: false,
          itemsPerPage: 20,
          sortBy: 'name',
          sortOrder: 'asc'
        }
      })
    }

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch settings' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    const settings = await prisma.displaySettings.upsert({
      where: { userId: 'default' },
      update: data,
      create: {
        userId: 'default',
        ...data
      }
    })

    return NextResponse.json(settings)

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update settings' 
    }, { status: 500 })
  }
}

