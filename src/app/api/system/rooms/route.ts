import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

// GET - Fetch all rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const roomTypeId = searchParams.get('roomTypeId');
    const id = searchParams.get('id');

    // Get specific room by ID
    if (id) {
      const roomId = parseInt(id);
      if (isNaN(roomId)) {
        return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
      }
      const response = await apiClient.getRoom(roomId);
      if (response.success) {
        return NextResponse.json(response.data);
      }
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Get rooms by status
    if (status) {
      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING', 'OUT_OF_SERVICE'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid room status' }, { status: 400 });
      }
      
      const backendResponse = await fetch(`http://103.81.87.99:5656/api/rooms/by-status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data.data || []);
      } else {
        const errorText = await backendResponse.text();
        console.error('Backend error:', errorText);
        return NextResponse.json({ error: `Backend error: ${backendResponse.status}` }, { status: 500 });
      }
    }

    // Get rooms by room type
    if (roomTypeId) {
      const typeId = parseInt(roomTypeId);
      if (isNaN(typeId)) {
        return NextResponse.json({ error: 'Invalid room type ID' }, { status: 400 });
      }

      const backendResponse = await fetch(`http://103.81.87.99:5656/api/rooms/by-room-type/${typeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data.data || []);
      } else {
        const errorText = await backendResponse.text();
        console.error('Backend error:', errorText);
        return NextResponse.json({ error: `Backend error: ${backendResponse.status}` }, { status: 500 });
      }
    }

    // Get all rooms (default)
    const response = await apiClient.getRooms();
    if (response.success) {
      return NextResponse.json(response.data);
    }
    return NextResponse.json({ error: response.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/system/rooms - Request body:', body);
    
    // Call backend directly
    const backendResponse = await fetch('http://103.81.87.99:5656/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify(body)
    });
    
    console.log('Backend response status:', backendResponse.status);
    
    if (backendResponse.ok) {
      const data = await backendResponse.json();
      console.log('Backend response data:', data);
      
      // Handle backend response format: {responseCode, message, data}
      if (data.responseCode === 'S0000' || data.responseCode === 'string') {
        return NextResponse.json(data.data, { status: 201 });
      } else {
        return NextResponse.json({ error: data.message || 'Backend error' }, { status: 500 });
      }
    } else {
      const errorText = await backendResponse.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ error: `Backend error: ${backendResponse.status}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('POST /api/system/rooms - Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ error: 'Room ID is required for update' }, { status: 400 });
    }
    const response = await apiClient.updateRoom(id, updateData);
    if (response.success) {
      return NextResponse.json(response.data);
    }
    return NextResponse.json({ error: response.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Room ID is required for deletion' }, { status: 400 });
    }
    const response = await apiClient.deleteRoom(Number(id));
    if (response.success) {
      return NextResponse.json({ message: 'Room deleted successfully' });
    }
    return NextResponse.json({ error: response.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}