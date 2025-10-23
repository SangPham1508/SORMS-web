import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty data until backend implements service orders API
    return NextResponse.json({ 
      top: [
        { name: 'Dọn phòng', count: 0 },
        { name: 'Giặt là', count: 0 },
        { name: 'Nước uống', count: 0 },
        { name: 'Massage', count: 0 },
        { name: 'Spa', count: 0 }
      ]
    })
  } catch (error) {
    console.error('Service Orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}



