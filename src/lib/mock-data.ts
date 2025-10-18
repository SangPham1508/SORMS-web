// Shared mock data for dashboard and admin pages
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "CLEANING" | "OUT_OF_SERVICE";
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Room {
  id: number;
  code: string;
  name?: string;
  room_type: string;
  floor?: number;
  status: RoomStatus;
  description?: string;
}

export interface Booking {
  id: number;
  code: string;
  user_name: string;
  room_code: string;
  checkin_date: string;
  checkout_date: string;
  num_guests: number;
  status: BookingStatus;
  note?: string;
}

export interface Task {
  id: number;
  title: string;
  assigned_to: string;
  due_at: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: TaskStatus;
  description?: string;
}

export interface Payment {
  id: number;
  code: string;
  payer_name: string;
  amount: number;
  created_at: string;
  status: PaymentStatus;
  description?: string;
}

export interface Service {
  id: number;
  code: string;
  name: string;
  unit_price: number;
  unit_name: string;
  is_active: boolean;
  description?: string;
}

export interface ServiceOrder {
  id: number;
  code: string;
  customer_name: string;
  room_code?: string;
  created_at: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  items: Array<{
    id: number;
    service_name: string;
    quantity: number;
    unit_price: number;
  }>;
  total_amount: number;
  note?: string;
}

// Mock data
export const mockRooms: Room[] = [
  { id: 1, code: "A101", name: "Phòng A101", room_type: "Standard", floor: 1, status: "AVAILABLE" },
  { id: 2, code: "A102", name: "Phòng A102", room_type: "Standard", floor: 1, status: "OCCUPIED" },
  { id: 3, code: "A103", name: "Phòng A103", room_type: "Standard", floor: 1, status: "OCCUPIED" },
  { id: 4, code: "A104", name: "Phòng A104", room_type: "Standard", floor: 1, status: "CLEANING" },
  { id: 5, code: "A105", name: "Phòng A105", room_type: "Standard", floor: 1, status: "AVAILABLE" },
  { id: 6, code: "B201", name: "Phòng B201", room_type: "Deluxe", floor: 2, status: "OCCUPIED" },
  { id: 7, code: "B202", name: "Phòng B202", room_type: "Deluxe", floor: 2, status: "OCCUPIED" },
  { id: 8, code: "B203", name: "Phòng B203", room_type: "Deluxe", floor: 2, status: "MAINTENANCE" },
  { id: 9, code: "B204", name: "Phòng B204", room_type: "Deluxe", floor: 2, status: "AVAILABLE" },
  { id: 10, code: "B205", name: "Phòng B205", room_type: "Deluxe", floor: 2, status: "OCCUPIED" },
  { id: 11, code: "C301", name: "Phòng C301", room_type: "Family", floor: 3, status: "OCCUPIED" },
  { id: 12, code: "C302", name: "Phòng C302", room_type: "Family", floor: 3, status: "AVAILABLE" },
  { id: 13, code: "C303", name: "Phòng C303", room_type: "Family", floor: 3, status: "OCCUPIED" },
  { id: 14, code: "C304", name: "Phòng C304", room_type: "Family", floor: 3, status: "CLEANING" },
  { id: 15, code: "C305", name: "Phòng C305", room_type: "Family", floor: 3, status: "OCCUPIED" },
];

export const mockBookings: Booking[] = [
  { id: 1, code: 'BK-0001', user_name: 'Nguyen Van A', room_code: 'A101', checkin_date: '2025-01-20', checkout_date: '2025-01-22', num_guests: 2, status: 'PENDING' },
  { id: 2, code: 'BK-0002', user_name: 'Tran Thi B', room_code: 'B201', checkin_date: '2025-01-18', checkout_date: '2025-01-20', num_guests: 3, status: 'APPROVED' },
  { id: 3, code: 'BK-0003', user_name: 'Le Van C', room_code: 'C301', checkin_date: '2025-01-17', checkout_date: '2025-01-19', num_guests: 1, status: 'CHECKED_IN' },
  { id: 4, code: 'BK-0004', user_name: 'Pham Thi D', room_code: 'A102', checkin_date: '2025-01-19', checkout_date: '2025-01-21', num_guests: 2, status: 'CHECKED_IN' },
  { id: 5, code: 'BK-0005', user_name: 'Hoang Van E', room_code: 'B202', checkin_date: '2025-01-21', checkout_date: '2025-01-23', num_guests: 4, status: 'PENDING' },
  { id: 6, code: 'BK-0006', user_name: 'Vu Thi F', room_code: 'C302', checkin_date: '2025-01-16', checkout_date: '2025-01-18', num_guests: 3, status: 'APPROVED' },
  { id: 7, code: 'BK-0007', user_name: 'Dang Van G', room_code: 'A103', checkin_date: '2025-01-22', checkout_date: '2025-01-24', num_guests: 2, status: 'PENDING' },
  { id: 8, code: 'BK-0008', user_name: 'Bui Thi H', room_code: 'B203', checkin_date: '2025-01-15', checkout_date: '2025-01-17', num_guests: 1, status: 'REJECTED' },
];

export const mockTasks: Task[] = [
  { id: 1, title: 'Dọn phòng A101', assigned_to: 'Nguyen Van A', due_at: '2025-01-20T10:00:00', priority: 'HIGH', status: 'TODO' },
  { id: 2, title: 'Kiểm tra hệ thống điện', assigned_to: 'Tran Van B', due_at: '2025-01-21T14:00:00', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 3, title: 'Bảo trì máy lạnh B201', assigned_to: 'Le Van C', due_at: '2025-01-19T09:00:00', priority: 'HIGH', status: 'DONE' },
  { id: 4, title: 'Thay ga giường C301', assigned_to: 'Pham Thi D', due_at: '2025-01-22T11:00:00', priority: 'LOW', status: 'TODO' },
  { id: 5, title: 'Kiểm tra hệ thống nước', assigned_to: 'Hoang Van E', due_at: '2025-01-23T15:00:00', priority: 'MEDIUM', status: 'IN_PROGRESS' },
  { id: 6, title: 'Vệ sinh hành lang', assigned_to: 'Vu Thi F', due_at: '2025-01-18T08:00:00', priority: 'LOW', status: 'DONE' },
  { id: 7, title: 'Sửa chữa TV A102', assigned_to: 'Dang Van G', due_at: '2025-01-24T13:00:00', priority: 'HIGH', status: 'TODO' },
  { id: 8, title: 'Kiểm tra cửa ra vào', assigned_to: 'Bui Thi H', due_at: '2025-01-17T16:00:00', priority: 'MEDIUM', status: 'CANCELLED' },
];

export const mockPayments: Payment[] = [
  { id: 1, code: 'PAY-0001', payer_name: 'Nguyen Van A', amount: 500000, created_at: '2025-01-20T10:30:00', status: 'COMPLETED' },
  { id: 2, code: 'PAY-0002', payer_name: 'Tran Thi B', amount: 750000, created_at: '2025-01-19T14:20:00', status: 'COMPLETED' },
  { id: 3, code: 'PAY-0003', payer_name: 'Le Van C', amount: 300000, created_at: '2025-01-18T09:15:00', status: 'PENDING' },
  { id: 4, code: 'PAY-0004', payer_name: 'Pham Thi D', amount: 600000, created_at: '2025-01-17T16:45:00', status: 'COMPLETED' },
  { id: 5, code: 'PAY-0005', payer_name: 'Hoang Van E', amount: 900000, created_at: '2025-01-16T11:30:00', status: 'FAILED' },
  { id: 6, code: 'PAY-0006', payer_name: 'Vu Thi F', amount: 450000, created_at: '2025-01-15T13:20:00', status: 'COMPLETED' },
];

export const mockServices: Service[] = [
  // Dịch vụ miễn phí
  { id: 1, code: 'SV-001', name: 'Dọn phòng', unit_price: 0, unit_name: 'lần', is_active: true, description: 'Dịch vụ dọn dẹp phòng nghỉ cơ bản' },
  { id: 2, code: 'SV-002', name: 'Thay ga giường', unit_price: 0, unit_name: 'lần', is_active: true, description: 'Thay ga giường và vệ sinh chăn gối' },
  { id: 3, code: 'SV-003', name: 'Vệ sinh hành lang', unit_price: 0, unit_name: 'lần', is_active: true, description: 'Dọn dẹp khu vực hành lang chung' },
  { id: 4, code: 'SV-004', name: 'Kiểm tra hệ thống', unit_price: 0, unit_name: 'lần', is_active: true, description: 'Kiểm tra hệ thống điện, nước, điều hòa' },
  
  // Dịch vụ có phí
  { id: 5, code: 'SV-005', name: 'Giặt là', unit_price: 30000, unit_name: 'kg', is_active: true, description: 'Giặt là quần áo theo yêu cầu' },
  { id: 6, code: 'SV-006', name: 'Nước uống', unit_price: 15000, unit_name: 'chai', is_active: true, description: 'Nước uống đóng chai các loại' },
  { id: 7, code: 'SV-007', name: 'Massage', unit_price: 200000, unit_name: 'giờ', is_active: true, description: 'Dịch vụ massage thư giãn' },
  { id: 8, code: 'SV-008', name: 'Spa', unit_price: 300000, unit_name: 'lần', is_active: true, description: 'Dịch vụ spa làm đẹp cao cấp' },
  { id: 9, code: 'SV-009', name: 'Đưa đón sân bay', unit_price: 150000, unit_name: 'chuyến', is_active: true, description: 'Dịch vụ đưa đón sân bay' },
  { id: 10, code: 'SV-010', name: 'Thuê xe', unit_price: 500000, unit_name: 'ngày', is_active: true, description: 'Thuê xe du lịch theo ngày' },
];

export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 1,
    code: 'SO-0001',
    customer_name: 'Nguyen Van A',
    room_code: 'A101',
    created_at: '2025-01-20T10:00:00',
    status: 'COMPLETED',
    items: [
      { id: 1, service_name: 'Dọn phòng', quantity: 2, unit_price: 0 },
      { id: 2, service_name: 'Nước uống', quantity: 4, unit_price: 15000 }
    ],
    total_amount: 60000,
    note: 'Khách VIP'
  },
  {
    id: 2,
    code: 'SO-0002',
    customer_name: 'Tran Thi B',
    room_code: 'B201',
    created_at: '2025-01-19T14:00:00',
    status: 'IN_PROGRESS',
    items: [
      { id: 3, service_name: 'Thay ga giường', quantity: 1, unit_price: 0 },
      { id: 4, service_name: 'Giặt là', quantity: 3, unit_price: 30000 },
      { id: 5, service_name: 'Massage', quantity: 1, unit_price: 200000 }
    ],
    total_amount: 290000,
    note: 'Cần hoàn thành trước 18h'
  },
  {
    id: 3,
    code: 'SO-0003',
    customer_name: 'Le Van C',
    room_code: 'C301',
    created_at: '2025-01-18T09:00:00',
    status: 'PENDING',
    items: [
      { id: 6, service_name: 'Dọn phòng', quantity: 1, unit_price: 0 },
      { id: 7, service_name: 'Vệ sinh hành lang', quantity: 1, unit_price: 0 }
    ],
    total_amount: 0,
    note: 'Dịch vụ miễn phí'
  },
  {
    id: 4,
    code: 'SO-0004',
    customer_name: 'Pham Thi D',
    room_code: 'A102',
    created_at: '2025-01-17T16:00:00',
    status: 'COMPLETED',
    items: [
      { id: 8, service_name: 'Spa', quantity: 1, unit_price: 300000 },
      { id: 9, service_name: 'Đưa đón sân bay', quantity: 1, unit_price: 150000 }
    ],
    total_amount: 450000,
    note: 'Đã thanh toán'
  },
  {
    id: 5,
    code: 'SO-0005',
    customer_name: 'Hoang Van E',
    room_code: 'B202',
    created_at: '2025-01-16T11:00:00',
    status: 'COMPLETED',
    items: [
      { id: 10, service_name: 'Kiểm tra hệ thống', quantity: 1, unit_price: 0 },
      { id: 11, service_name: 'Thuê xe', quantity: 2, unit_price: 500000 }
    ],
    total_amount: 1000000,
    note: 'Thuê xe 2 ngày'
  }
];

// Dashboard calculation functions
export function getDashboardData() {
  const totalRooms = mockRooms.length;
  const occupiedRooms = mockRooms.filter(r => r.status === 'OCCUPIED').length;
  const pendingBookings = mockBookings.filter(b => b.status === 'PENDING').length;
  const completedPayments = mockPayments.filter(p => p.status === 'COMPLETED');
  const paymentsToday = completedPayments.length;
  const revenueToday = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const tasksTodo = mockTasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS').length;

  return {
    occupancy: { total: totalRooms, occupied: occupiedRooms },
    bookings: { pending: pendingBookings },
    payments: { count: paymentsToday, sum: revenueToday },
    tasks: { 
      todo: mockTasks.filter(t => t.status === 'TODO').length,
      in_progress: mockTasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: mockTasks.filter(t => t.status === 'DONE').length,
      cancelled: mockTasks.filter(t => t.status === 'CANCELLED').length
    },
    services: {
      top: [
        { name: 'Dọn phòng', count: 45 },
        { name: 'Giặt là', count: 28 },
        { name: 'Nước uống', count: 22 },
        { name: 'Massage', count: 15 },
        { name: 'Spa', count: 12 },
      ]
    }
  };
}

export function getTimeSeriesData(days: number) {
  const today = new Date();
  const series = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    
    // Generate realistic data based on day of week
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const bookingsCount = Math.floor((isWeekend ? 3 : 2) + Math.random() * 4);
    const checkinsCount = Math.floor((isWeekend ? 2 : 1) + Math.random() * 3);
    const paymentsSum = Math.floor((isWeekend ? 200000 : 150000) + Math.random() * 400000);
    
    series.push({
      date: dateStr,
      bookings: bookingsCount,
      checkins: checkinsCount,
      payments: paymentsSum
    });
  }
  
  return series;
}
