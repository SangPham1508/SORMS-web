import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

type User = {
  id: number
  email: string
  full_name: string
  phone_number?: string
  status: 'ACTIVE' | 'INACTIVE'
  roles: string[]
}

// Mock users - sẽ được thay thế bằng database query
const mockUsers: User[] = [
  {
    id: 1,
    email: 'quyentnqe170062@fpt.edu.vn',
    full_name: 'System Admin',
    phone_number: '0900000001',
    status: 'ACTIVE',
    roles: ['admin']
  }
]

// Helper: Check if user is admin
async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const email = (token as any)?.email as string | undefined
  const adminEmail = process.env.ADMIN_EMAIL_WHITELIST || 'quyentnqe170062@fpt.edu.vn'
  return email?.toLowerCase() === adminEmail.toLowerCase()
}

// GET - Lấy danh sách users (chỉ admin)
export async function GET(req: NextRequest) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  // Check admin permission
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // TODO: Query database thay vì dùng mock
  return NextResponse.json({ items: useMock ? mockUsers : [] })
}

// POST - Activate/Deactivate user hoặc tạo user mới
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    // Create new user (khi user login lần đầu) - KHÔNG cần admin permission
    if (action === 'create') {
      const body = await req.json()
      const { email, full_name, phone_number, role } = body

      if (!email || !full_name) {
        return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 })
      }

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (existingUser) {
        return NextResponse.json({ success: true, user: existingUser })
      }

      // Determine status: Admin email is ACTIVE, others are INACTIVE
      const adminEmail = process.env.ADMIN_EMAIL_WHITELIST || 'quyentnqe170062@fpt.edu.vn'
      const isAdminEmail = email.toLowerCase() === adminEmail.toLowerCase()

      // Create new user
      const newUser: User = {
        id: mockUsers.length + 1,
        email,
        full_name,
        phone_number,
        status: isAdminEmail ? 'ACTIVE' : 'INACTIVE', // Admin ACTIVE, others INACTIVE
        roles: role ? [role] : []
      }

      mockUsers.push(newUser)
      return NextResponse.json({ success: true, user: newUser }, { status: 201 })
    }

    // Các action khác CẦN admin permission
    if (!await isAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Activate user
    if (action === 'activate' && userId) {
      const id = parseInt(userId)
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
      }

      // TODO: Update database
      const userIndex = mockUsers.findIndex(u => u.id === id)
      if (userIndex !== -1) {
        mockUsers[userIndex].status = 'ACTIVE'
        return NextResponse.json({ success: true, user: mockUsers[userIndex] })
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Deactivate user
    if (action === 'deactivate' && userId) {
      const id = parseInt(userId)
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
      }

      // TODO: Update database
      const userIndex = mockUsers.findIndex(u => u.id === id)
      if (userIndex !== -1) {
        mockUsers[userIndex].status = 'INACTIVE'
        return NextResponse.json({ success: true, user: mockUsers[userIndex] })
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


