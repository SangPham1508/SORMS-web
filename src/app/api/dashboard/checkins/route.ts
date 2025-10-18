import { NextRequest, NextResponse } from 'next/server'
import { getTimeSeriesData } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(Number(searchParams.get('days') || '14'), 7), 30)
  
  const series = getTimeSeriesData(days)
  
  return NextResponse.json({
    total: series.reduce((sum, s) => sum + s.checkins, 0),
    series: series.map(s => ({ date: s.date, count: s.checkins }))
  })
}



