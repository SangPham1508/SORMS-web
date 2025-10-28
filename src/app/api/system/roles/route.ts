import { NextResponse } from 'next/server'

type Role = { id: number; code: string; name: string; description?: string; isVisible: boolean }

const mockRoles: Role[] = [
  { id: 1, code: 'admin', name: 'Admin', description: 'System Administrator', isVisible: true },
  { id: 2, code: 'office', name: 'Office', description: 'Office Staff', isVisible: true },
  { id: 3, code: 'lecture', name: 'Lecture', description: 'Lecturer', isVisible: false },
  { id: 4, code: 'staff', name: 'Staff', description: 'Employee', isVisible: true },
  { id: 5, code: 'guest', name: 'Guest', description: 'Visitor', isVisible: false },
  { id: 6, code: 'manager', name: 'Manager', description: 'Department Manager', isVisible: true },
  { id: 7, code: 'accountant', name: 'Accountant', description: 'Finance & Billing', isVisible: true },
  { id: 8, code: 'cleaner', name: 'Cleaner', description: 'Housekeeping', isVisible: true },
  { id: 9, code: 'technician', name: 'Technician', description: 'Maintenance Technician', isVisible: true },
  { id: 10, code: 'auditor', name: 'Auditor', description: 'Internal Audit', isVisible: false },
  { id: 11, code: 'hr', name: 'HR', description: 'Human Resources', isVisible: true },
  { id: 12, code: 'security', name: 'Security', description: 'Security Staff', isVisible: true },
  { id: 13, code: 'sales', name: 'Sales', description: 'Sales & Marketing', isVisible: true },
  { id: 14, code: 'reception', name: 'Reception', description: 'Front Desk', isVisible: true },
  { id: 15, code: 'it', name: 'IT', description: 'IT Support', isVisible: true },
]

export async function GET() {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  return NextResponse.json({ items: useMock ? mockRoles : [] })
}


