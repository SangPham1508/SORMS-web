import { NextResponse } from 'next/server'

type User = {
  id: number
  email: string
  full_name: string
  phone_number?: string
  status: 'ACTIVE' | 'INACTIVE'
  roles: string[]
}

const mockUsers: User[] = [
  { id: 1, email: 'admin@fpt.edu.vn', full_name: 'System Admin', phone_number: '0900000001', status: 'ACTIVE', roles: ['admin'] },
  { id: 2, email: 'office01@fe.edu.vn', full_name: 'Office User', phone_number: '0900000002', status: 'INACTIVE', roles: ['office'] },
  { id: 3, email: 'guest@example.com', full_name: 'Khách', phone_number: '0900000003', status: 'ACTIVE', roles: ['guest'] },
]

export async function GET() {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  return NextResponse.json({ items: useMock ? mockUsers : [] })
}


