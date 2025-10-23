// API Client for connecting to backend
import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Handle backend response format: {responseCode, message, data}
      if (data.responseCode && data.message) {
        if (data.responseCode === 'S0000') {
          return {
            success: true,
            data: data.data,
          }
        } else {
          return {
            success: false,
            error: data.message,
          }
        }
      }
      
      // Fallback for other response formats
      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PATCH request (now using PUT)
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Specific API methods for SORMS - Only use available endpoints
  async getRooms() {
    return this.get('/rooms')
  }

  async getRoom(id: number) {
    return this.get(`/rooms/${id}`)
  }

  async createRoom(roomData: any) {
    const formattedData = {
      code: roomData.code,
      name: roomData.name || '',
      roomTypeId: roomData.roomTypeId,
      floor: roomData.floor || 1,
      status: roomData.status || 'AVAILABLE',
      description: roomData.description || ''
    }
    return this.post('/rooms', formattedData)
  }

  async updateRoom(id: number, roomData: any) {
    const formattedData = {
      code: roomData.code,
      name: roomData.name || '',
      roomTypeId: roomData.roomTypeId,
      floor: roomData.floor || 1,
      status: roomData.status || 'AVAILABLE',
      description: roomData.description || ''
    }
    return this.put(`/rooms/${id}`, formattedData)
  }

  async deleteRoom(id: number) {
    return this.delete(`/rooms/${id}`)
  }

  // Additional room methods for filtering
  async getRoomsByStatus(status: string) {
    return this.get(`/rooms/by-status/${status}`)
  }

  async getRoomsByRoomType(roomTypeId: number) {
    return this.get(`/rooms/by-room-type/${roomTypeId}`)
  }


  async getRoomTypes() {
    return this.get('/room-types')
  }

  async getRoomType(id: number) {
    return this.get(`/room-types/${id}`)
  }

  async createRoomType(roomTypeData: any) {
    const formattedData = {
      code: roomTypeData.code,
      name: roomTypeData.name,
      basePrice: roomTypeData.basePrice || 0,
      maxOccupancy: roomTypeData.maxOccupancy || 1,
      description: roomTypeData.description || ''
    }
    return this.post('/room-types', formattedData)
  }

  async updateRoomType(id: number, roomTypeData: any) {
    const formattedData = {
      code: roomTypeData.code,
      name: roomTypeData.name,
      basePrice: roomTypeData.basePrice || 0,
      maxOccupancy: roomTypeData.maxOccupancy || 1,
      description: roomTypeData.description || ''
    }
    return this.put(`/room-types/${id}`, formattedData)
  }

  async deleteRoomType(id: number) {
    return this.delete(`/room-types/${id}`)
  }

  async getBookings() {
    return this.get('/bookings')
  }

  async getBooking(id: number) {
    return this.get(`/bookings/${id}`)
  }

  async createBooking(bookingData: any) {
    // Ensure data matches API format
    const formattedData = {
      code: bookingData.code,
      userId: bookingData.userId || bookingData.user_id,
      roomId: bookingData.roomId || bookingData.room_id,
      checkinDate: bookingData.checkinDate || bookingData.checkin_date,
      checkoutDate: bookingData.checkoutDate || bookingData.checkout_date,
      numGuests: bookingData.numGuests || bookingData.num_guests,
      note: bookingData.note || '',
      status: bookingData.status || 'PENDING'
    }
    return this.post('/bookings', formattedData)
  }

  async updateBooking(id: number, bookingData: any) {
    const formattedData = {
      code: bookingData.code,
      userId: bookingData.userId || bookingData.user_id,
      roomId: bookingData.roomId || bookingData.room_id,
      checkinDate: bookingData.checkinDate || bookingData.checkin_date,
      checkoutDate: bookingData.checkoutDate || bookingData.checkout_date,
      numGuests: bookingData.numGuests || bookingData.num_guests,
      note: bookingData.note || '',
      status: bookingData.status
    }
    return this.patch(`/bookings/${id}`, formattedData)
  }

  async deleteBooking(id: number) {
    return this.delete(`/bookings/${id}`)
  }

  // Additional booking methods for filtering and actions
  async getBookingsByUser(userId: number) {
    return this.get(`/bookings/by-user/${userId}`)
  }

  async getBookingsByStatus(status: string) {
    return this.get(`/bookings/by-status/${status}`)
  }

  async checkinBooking(id: number) {
    return this.post(`/bookings/${id}/checkin`)
  }

  async approveBooking(id: number) {
    return this.post(`/bookings/${id}/approve`)
  }

  async getServices() {
    return this.get('/services')
  }

  async getService(id: number) {
    return this.get(`/services/${id}`)
  }

  async createService(serviceData: any) {
    // Ensure data matches API format
    const formattedData = {
      code: serviceData.code,
      name: serviceData.name,
      description: serviceData.description || '',
      unitPrice: serviceData.unitPrice || serviceData.unit_price,
      unitName: serviceData.unitName || serviceData.unit_name,
      isActive: serviceData.isActive !== undefined ? serviceData.isActive : serviceData.is_active !== undefined ? serviceData.is_active : true
    }
    return this.post('/services', formattedData)
  }

  async updateService(id: number, serviceData: any) {
    const formattedData = {
      code: serviceData.code,
      name: serviceData.name,
      description: serviceData.description || '',
      unitPrice: serviceData.unitPrice || serviceData.unit_price,
      unitName: serviceData.unitName || serviceData.unit_name,
      isActive: serviceData.isActive !== undefined ? serviceData.isActive : serviceData.is_active
    }
    return this.put(`/services/${id}`, formattedData)
  }

  async deleteService(id: number) {
    return this.delete(`/services/${id}`)
  }

  // Placeholder methods for future implementation
  async getServiceOrders() {
    return { success: false, error: 'API not implemented yet' }
  }

  async getPaymentTransactions() {
    return { success: false, error: 'API not implemented yet' }
  }

  async getStaffTasks() {
    return { success: false, error: 'API not implemented yet' }
  }

  async getUsers() {
    return { success: false, error: 'API not implemented yet' }
  }

  // Dashboard endpoints - calculate from real data
  async getDashboardStats() {
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        this.getRooms(),
        this.getBookings()
      ])
      
      const rooms = (roomsResponse.data || []) as any[]
      const bookings = (bookingsResponse.data || []) as any[]
      
      const totalRooms = rooms.length
      const occupiedRooms = rooms.filter((r: any) => r.status === 'OCCUPIED').length
      const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length
      
      // Calculate total revenue from bookings (simplified calculation)
      const totalRevenue = bookings.reduce((sum: number, b: any) => {
        // This is a simplified calculation - in real app you'd calculate actual room costs
        return sum + (b.numGuests * 500000) // Assume 500k per guest per booking
      }, 0)
      
      return { 
        success: true, 
        data: { 
          totalRooms, 
          occupiedRooms, 
          pendingBookings, 
          totalRevenue 
        } 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to calculate dashboard stats' 
      }
    }
  }

  async getOccupancyStats() {
    try {
      const roomsResponse = await this.getRooms()
      if (!roomsResponse.success) {
        return { 
          success: false, 
          error: 'Failed to fetch rooms data' 
        }
      }
      
      const rooms = (roomsResponse.data || []) as any[]
      const total = rooms.length
      const occupied = rooms.filter((r: any) => r.status === 'OCCUPIED').length
      
      return { 
        success: true, 
        data: { 
          total, 
          occupied 
        } 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to calculate occupancy stats' 
      }
    }
  }

  async getBookingStats() {
    try {
      const bookingsResponse = await this.getBookings()
      if (!bookingsResponse.success) {
        return { 
          success: false, 
          error: 'Failed to fetch bookings data' 
        }
      }
      
      const bookings = (bookingsResponse.data || []) as any[]
      const pending = bookings.filter((b: any) => b.status === 'PENDING').length
      
      // Generate time series data from real bookings
      const today = new Date()
      const series = []
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const dateStr = date.toISOString().slice(0, 10)
        
        // Count bookings for this date
        const count = bookings.filter((b: any) => 
          b.checkinDate && b.checkinDate.slice(0, 10) === dateStr
        ).length
        
        series.push({ 
          date: dateStr, 
          count 
        })
      }
      
      return { 
        success: true, 
        data: { 
          pending, 
          series 
        } 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to calculate booking stats' 
      }
    }
  }

  async getPaymentStats() {
    // Payment API not implemented yet - return empty data
    return { 
      success: true, 
      data: { 
        count: 0, 
        sum: 0, 
        series: [] 
      } 
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiResponse }
