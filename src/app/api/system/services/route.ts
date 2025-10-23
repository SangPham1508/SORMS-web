import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

// GET - Fetch all services or specific service by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Get specific service by ID
    if (id) {
      const serviceId = parseInt(id);
      if (isNaN(serviceId)) {
        return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
      }
      const response = await apiClient.getService(serviceId);
      if (response.success) {
        return NextResponse.json(response.data);
      }
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Get all services (default)
    const response = await apiClient.getServices()
    
    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch services' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Services API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = await apiClient.createService(body)
    
    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to create service' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error('Create service API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('PUT /api/system/services - Request body:', body)
    
    const response = await apiClient.updateService(body.id, body)
    console.log('PUT /api/system/services - API response:', response)
    
    if (!response.success) {
      console.error('PUT /api/system/services - API error:', response.error)
      return NextResponse.json(
        { error: response.error || 'Failed to update service' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Update service API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required for deletion' }, { status: 400 });
    }
    
    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }
    
    const response = await apiClient.deleteService(serviceId);
    if (response.success) {
      return NextResponse.json({ message: 'Service deleted successfully' });
    }
    return NextResponse.json({ error: response.error }, { status: 500 });
  } catch (error) {
    console.error('Delete service API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}




