import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const uploads = await prisma.contactUpload.findMany({
      orderBy: { uploadDate: 'desc' },
      take: 50 // Limit to last 50 uploads
    })

    return NextResponse.json({ uploads })

  } catch (error) {
    console.error('Uploads fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch uploads' 
    }, { status: 500 })
  }
}

