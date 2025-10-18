import { NextResponse } from 'next/server'
import { getDashboardData } from '@/lib/mock-data'

export async function GET() {
  const data = getDashboardData()
  return NextResponse.json(data.tasks)
}



