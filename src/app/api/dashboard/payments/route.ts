import { NextRequest, NextResponse } from 'next/server'
import { getDashboardData, getTimeSeriesData } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const days = Math.min(Math.max(Number(searchParams.get('days') || '14'), 7), 30)
  
  const data = getDashboardData()
  const series = getTimeSeriesData(days)
  
  return NextResponse.json({
    count: data.payments.count,
    sum: data.payments.sum,
    series: series.map(s => ({ date: s.date, sum: s.payments }))
  })
}



