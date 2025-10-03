import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Parse search query with AND, OR, NOT operators
function parseSearchQuery(query: string) {
  const searchFields = ['name', 'email', 'phone', 'address', 'notes']
  
  // Simple tokenization - split by spaces but preserve quoted strings
  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []
  
  if (tokens.length === 0) return {}
  
  // If no operators, treat as simple search
  if (!tokens.some(token => ['AND', 'OR', 'NOT'].includes(token.toUpperCase()))) {
    return {
      OR: searchFields.map(field => ({
        [field]: { contains: query }
      }))
    }
  }
  
  // Parse with operators
  let conditions: any[] = []
  let i = 0
  
  while (i < tokens.length) {
    const token = tokens[i].trim()
    
    if (token.toUpperCase() === 'NOT') {
      i++
      if (i < tokens.length) {
        const nextToken = tokens[i].replace(/"/g, '')
        conditions.push({
          NOT: {
            OR: searchFields.map(field => ({
              [field]: { contains: nextToken }
            }))
          }
        })
      }
    } else if (token.toUpperCase() === 'AND') {
      i++
      if (i < tokens.length) {
        const nextToken = tokens[i].replace(/"/g, '')
        if (conditions.length > 0) {
          const lastCondition = conditions[conditions.length - 1]
          conditions[conditions.length - 1] = {
            AND: [
              lastCondition,
              {
                OR: searchFields.map(field => ({
                  [field]: { contains: nextToken }
                }))
              }
            ]
          }
        }
      }
    } else if (token.toUpperCase() === 'OR') {
      i++
      if (i < tokens.length) {
        const nextToken = tokens[i].replace(/"/g, '')
        conditions.push({
          OR: searchFields.map(field => ({
            [field]: { contains: nextToken }
          }))
        })
      }
    } else {
      // Regular search term
      const searchTerm = token.replace(/"/g, '')
      conditions.push({
        OR: searchFields.map(field => ({
          [field]: { contains: searchTerm }
        }))
      })
    }
    i++
  }
  
  if (conditions.length === 0) return {}
  if (conditions.length === 1) return conditions[0]
  
  // Combine multiple conditions with AND
  return {
    AND: conditions
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    const groupId = searchParams.get('groupId')

    const skip = (page - 1) * limit

    // Build where clause for search
    let where = {}
    
    if (search) {
      // Handle "Empty X" search patterns
      if (search.toLowerCase().startsWith('empty ')) {
        const field = search.toLowerCase().replace('empty ', '').trim()
        switch (field) {
          case 'phone':
            where = { phone: null }
            break
          case 'email':
            where = { email: null }
            break
          case 'address':
            where = { address: null }
            break
          case 'name':
            where = { name: null }
            break
          case 'notes':
            where = { notes: null }
            break
          default:
            // If field not recognized, search for contacts with any empty field
            where = {
              OR: [
                { phone: null },
                { email: null },
                { address: null },
                { name: null },
                { notes: null }
              ]
            }
        }
      } else {
        // Parse search with AND, OR, NOT operators
        where = parseSearchQuery(search)
      }
    }

    // Add group filter if specified
    if (groupId) {
      console.log('API: Filtering by group:', groupId)
      where = {
        ...where,
        groups: {
          some: {
            groupId: groupId
          }
        }
      }
    }

    // Build orderBy clause
    const orderBy = {
      [sortBy]: sortOrder
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where: {
          ...where,
          isActive: true
        },
        orderBy,
        skip,
        take: limit,
        include: {
          upload: true
        }
      }),
      prisma.contact.count({
        where: {
          ...where,
          isActive: true
        }
      })
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Contacts fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch contacts' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, search, groupId } = await request.json()
    
    if (action === 'getAllIds') {
      // Get all contact IDs matching search criteria
      let where: any = { isActive: true }
      
      if (search) {
        console.log('API: Getting all IDs for search:', search)
        if (search.toLowerCase().startsWith('empty ')) {
          const field = search.toLowerCase().replace('empty ', '').trim()
          switch (field) {
            case 'phone': where = { ...where, phone: null }; break
            case 'email': where = { ...where, email: null }; break
            case 'address': where = { ...where, address: null }; break
            case 'name': where = { ...where, name: null }; break
            case 'notes': where = { ...where, notes: null }; break
            default:
              where = {
                ...where,
                OR: [{ phone: null }, { email: null }, { address: null }, { name: null }, { notes: null }]
              }
          }
        } else {
          where = { ...where, ...parseSearchQuery(search) }
        }
      }

      // Add group filter if specified
      if (groupId) {
        console.log('API: Getting all IDs for group:', groupId)
        where = {
          ...where,
          groups: {
            some: {
              groupId: groupId
            }
          }
        }
      }
      
      const contacts = await prisma.contact.findMany({
        where,
        select: { id: true }
      })
      
      console.log('API: Found contact IDs:', contacts.length)
      return NextResponse.json({ contactIds: contacts.map(c => c.id) })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Failed to get contact IDs:', error)
    return NextResponse.json({ error: 'Failed to get contact IDs' }, { status: 500 })
  }
}

