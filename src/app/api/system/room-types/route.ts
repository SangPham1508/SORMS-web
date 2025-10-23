import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

// GET - Fetch all room types or specific room type by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get specific room type by ID
    if (id) {
      const roomTypeId = parseInt(id);
      if (isNaN(roomTypeId)) {
        return NextResponse.json({ error: 'Invalid room type ID' }, { status: 400 });
      }
      
      const response = await apiClient.getRoomType(roomTypeId);
      if (response.success) {
        return NextResponse.json(response.data);
      }
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Get all room types (default)
    const backendResponse = await fetch('http://103.81.87.99:5656/api/room-types', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      }
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data.data)
    } else {
      return NextResponse.json(
        { error: `Backend error: ${backendResponse.status}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}

// POST - Create new room type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, basePrice, maxOccupancy, description } = body

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Code and name are required' },
        { status: 400 }
      )
    }

    // Call backend directly
    const backendResponse = await fetch('http://103.81.87.99:5656/api/room-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({
        code,
        name,
        basePrice: basePrice || 0,
        maxOccupancy: maxOccupancy || 1,
        description: description || ''
      })
    })
    
    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data.data, { status: 201 })
    } else {
      const errorText = await backendResponse.text()
      return NextResponse.json({ error: `Backend error: ${backendResponse.status}` }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating room type:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create room type' },
      { status: 500 }
    )
  }
}

// PUT - Update room type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, code, name, basePrice, maxOccupancy, description } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room type ID is required' },
        { status: 400 }
      )
    }

    // Update room type via API client
    const response = await apiClient.updateRoomType(id, {
      code,
      name,
      basePrice: basePrice || 0,
      maxOccupancy: maxOccupancy || 1,
      description: description || ''
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating room type:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update room type' },
      { status: 500 }
    )
  }
}

// DELETE - Delete room type
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room type ID is required' },
        { status: 400 }
      )
    }

    // Delete room type via API client
    const response = await apiClient.deleteRoomType(parseInt(id))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting room type:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete room type' },
      { status: 500 }
    )
  }
}
