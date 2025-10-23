import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: 'Tasks API not implemented yet' }, 
    { status: 501 }
  )
}

export async function PUT(req: NextRequest) {
  return NextResponse.json(
    { error: 'Tasks API not implemented yet' }, 
    { status: 501 }
  )
}


