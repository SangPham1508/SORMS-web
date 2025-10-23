import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty data until backend implements tasks API
    return NextResponse.json({
      todo: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0
    })
  } catch (error) {
    console.error('Tasks API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}



