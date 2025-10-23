"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { createBookingNotification } from "@/lib/notifications";
import { useRooms, useBookings, useServiceOrders, usePayments } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";

type Room = {
  id: number;
  building: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  amenities: string[];
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  description: string;
};

type RoomBooking = {
  id: number;
  roomId: number;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
  purpose: string; // Mục đích sử dụng
  guestName: string;
  guestEmail: string;
  phoneNumber: string;
  building: string;
  roomNumber: string;
  rejectionReason?: string;
  confirmedAt?: string;
};

type ServiceOrder = {
  id: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  orderDate: string;
  deliveryDate?: string;
};

type Payment = {
  id: number;
  bookingId?: number;
  serviceOrderId?: number;
  description: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
};

export default function UserPage() {
  // Set user role in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      let role = 'guest'; // default
      
      // Check sessionStorage first
      const storedRole = sessionStorage.getItem('userRole');
      if (storedRole) {
        role = storedRole;
      } else {
        // Check cookies
        const cookies = document.cookie.split(';');
        const roleCookie = cookies.find(cookie => cookie.trim().startsWith('role='));
        if (roleCookie) {
          role = roleCookie.split('=')[1];
        }
      }
      
      sessionStorage.setItem('userRole', role);
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'rooms' | 'booking' | 'services' | 'payments'>('rooms');
  
  // Determine if user is lecturer
  const [isLecturer, setIsLecturer] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = sessionStorage.getItem('userRole') || 'guest';
      setIsLecturer(role === 'lecturer');
    }
  }, []);

  // Use API hooks for data fetching
  const { data: roomsData, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings();
  const { data: serviceOrdersData, loading: serviceOrdersLoading, error: serviceOrdersError, refetch: refetchServiceOrders } = useServiceOrders();
  const { data: paymentsData, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = usePayments();

  // Transform API data to match component types
  const rooms: Room[] = (roomsData as any)?.data || [];
  const bookings: RoomBooking[] = (bookingsData as any)?.data || [];
  const serviceOrders: ServiceOrder[] = (serviceOrdersData as any)?.data || [];
  const payments: Payment[] = (paymentsData as any)?.data || [];
  
  // Bookings are now loaded from API via useBookings hook

  // Service orders are now loaded from API via useServiceOrders hook

  // Payments/payments are now loaded from API via usePayments hook

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-hide success/error messages after a few seconds
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  // Form states for new booking
  const [newBooking, setNewBooking] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    purpose: 'Công tác để ở',
    guestName: '',
    guestEmail: '',
    phoneNumber: ''
  });

  // Form states for new service order
  const [newServiceOrder, setNewServiceOrder] = useState({
    serviceName: '',
    quantity: 1,
    unitPrice: 0
  });

  // Form states for payment
  const [paymentData, setPaymentData] = useState({
    method: '',
    amount: 0
  });

  const handleCreateBooking = async () => {
    if (!selectedRoom) {
      setFlash({ type: 'error', text: 'Vui lòng chọn phòng' });
      return;
    }

    // Validation
    if (!newBooking.guestName.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập tên khách hàng' });
      return;
    }
    if (!newBooking.guestEmail.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập email' });
      return;
    }
    if (!newBooking.phoneNumber.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập số điện thoại' });
      return;
    }
    if (!newBooking.checkIn) {
      setFlash({ type: 'error', text: 'Vui lòng chọn ngày check-in' });
      return;
    }
    if (!newBooking.checkOut) {
      setFlash({ type: 'error', text: 'Vui lòng chọn ngày check-out' });
      return;
    }
    if (new Date(newBooking.checkIn) >= new Date(newBooking.checkOut)) {
      setFlash({ type: 'error', text: 'Ngày check-out phải sau ngày check-in' });
      return;
    }
    if (newBooking.guests > selectedRoom.capacity) {
      setFlash({ type: 'error', text: `Số khách không được vượt quá ${selectedRoom.capacity} người` });
      return;
    }

    try {
      const bookingData = {
        roomId: selectedRoom.id,
        roomType: selectedRoom.roomType,
        checkIn: newBooking.checkIn,
        checkOut: newBooking.checkOut,
        guests: newBooking.guests,
        purpose: newBooking.purpose,
        guestName: newBooking.guestName,
        guestEmail: newBooking.guestEmail,
        phoneNumber: newBooking.phoneNumber,
        building: selectedRoom.building,
        roomNumber: selectedRoom.roomNumber,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      const response = await apiClient.createBooking(bookingData);
      
      if (response.success) {
        setFlash({ type: 'success', text: 'Gửi yêu cầu đặt phòng thành công! Hành chính sẽ xác nhận trong thời gian sớm nhất.' });
        setBookingModalOpen(false);
        setSelectedRoom(null);
        setNewBooking({ 
          checkIn: '', 
          checkOut: '', 
          guests: 1, 
          purpose: 'Công tác để ở',
          guestName: '',
          guestEmail: '',
          phoneNumber: ''
        });
        
        // Refresh bookings data
        refetchBookings();
        
        // Create notification
        createBookingNotification(
          (response.data as any)?.id || Date.now(),
          newBooking.guestName,
          `${selectedRoom.building} - ${selectedRoom.roomNumber}`,
          'PENDING'
        );
      } else {
        setFlash({ type: 'error', text: response.error || 'Có lỗi xảy ra khi đặt phòng' });
      }
    } catch (error) {
      setFlash({ type: 'error', text: 'Có lỗi xảy ra khi đặt phòng' });
      console.error('Booking creation error:', error);
    }
  };

  const handleCreateServiceOrder = async () => {
    if (!newServiceOrder.serviceName || newServiceOrder.quantity <= 0) {
      setFlash({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin đặt dịch vụ' });
      return;
    }

    try {
      const serviceOrderData = {
        serviceName: newServiceOrder.serviceName,
        quantity: newServiceOrder.quantity,
        unitPrice: newServiceOrder.unitPrice,
        totalPrice: newServiceOrder.quantity * newServiceOrder.unitPrice,
        status: 'PENDING',
        orderDate: new Date().toISOString()
      };

      const response = await apiClient.createServiceOrder(serviceOrderData);
      
      if (response.success) {
        setServiceModalOpen(false);
        setNewServiceOrder({ serviceName: '', quantity: 1, unitPrice: 0 });
        setFlash({ type: 'success', text: 'Đặt dịch vụ thành công!' });
        
        // Refresh service orders data
        refetchServiceOrders();
      } else {
        setFlash({ type: 'error', text: response.error || 'Có lỗi xảy ra khi đặt dịch vụ' });
      }
    } catch (error) {
      setFlash({ type: 'error', text: 'Có lỗi xảy ra khi đặt dịch vụ' });
      console.error('Service order creation error:', error);
    }
  };

  const handlePayment = async () => {
    if (!paymentData.method || paymentData.amount <= 0) {
      setFlash({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin thanh toán' });
      return;
    }

    if (selectedPayment) {
      try {
        const paymentDataToSend = {
          paymentId: selectedPayment.id,
          amount: paymentData.amount,
          method: paymentData.method,
          status: 'PAID',
          paidDate: new Date().toISOString()
        };

        const response = await apiClient.createPayment(paymentDataToSend);
        
        if (response.success) {
          setPaymentModalOpen(false);
          setSelectedPayment(null);
          setPaymentData({ method: '', amount: 0 });
          setFlash({ type: 'success', text: 'Thanh toán thành công!' });
          
          // Refresh payments data
          refetchPayments();
        } else {
          setFlash({ type: 'error', text: response.error || 'Có lỗi xảy ra khi thanh toán' });
        }
      } catch (error) {
        setFlash({ type: 'error', text: 'Có lỗi xảy ra khi thanh toán' });
        console.error('Payment error:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge tone="warning">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge tone="success">Đã xác nhận</Badge>;
      case 'CANCELLED':
        return <Badge tone="error">Đã hủy</Badge>;
      case 'COMPLETED':
        return <Badge tone="success">Hoàn thành</Badge>;
      case 'PAID':
        return <Badge tone="success">Đã thanh toán</Badge>;
      case 'OVERDUE':
        return <Badge tone="error">Quá hạn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const totalServices = serviceOrders.length;
  const completedServices = serviceOrders.filter(s => s.status === 'COMPLETED').length;
  const totalPayments = payments.length;
  const paidPayments = payments.filter(i => i.status === 'PAID').length;
  const pendingPayments = payments.filter(i => i.status === 'PENDING').length;
  const overduePayments = payments.filter(i => i.status === 'OVERDUE').length;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1 pl-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {isLecturer ? 'Giảng viên' : 'Khách hàng'}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                {isLecturer ? 'Quản lý đặt phòng và dịch vụ cho giảng viên' : 'Quản lý đặt phòng và dịch vụ'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Flash Messages */}
          {flash && (
            <div className={`rounded-md border p-2 sm:p-3 text-xs sm:text-sm shadow-sm ${
              flash.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {flash.text}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
                  <div className="text-sm text-gray-600">Tổng đặt phòng</div>
                  <div className="text-xs text-gray-500">{confirmedBookings} đã xác nhận</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalServices}</div>
                  <div className="text-sm text-gray-600">Dịch vụ đã đặt</div>
                  <div className="text-xs text-gray-500">{completedServices} hoàn thành</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalPayments}</div>
                  <div className="text-sm text-gray-600">Hóa đơn</div>
                  <div className="text-xs text-gray-500">{paidPayments} đã thanh toán</div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingPayments + overduePayments}</div>
                  <div className="text-sm text-gray-600">Chờ thanh toán</div>
                  <div className="text-xs text-gray-500">{overduePayments} quá hạn</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Phòng có sẵn ({rooms.filter(r => r.status === 'AVAILABLE').length})
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'booking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đặt phòng ({totalBookings})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dịch vụ ({totalServices})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Hóa đơn ({totalPayments})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Phòng có sẵn</h2>
                <div className="text-sm text-gray-600">
                  Hiển thị {rooms.filter(r => r.status === 'AVAILABLE').length} phòng trống
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.filter(room => room.status === 'AVAILABLE').map((room) => (
                  <Card key={room.id} className="hover:shadow-lg transition-shadow">
                    <CardBody>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {room.building} - {room.roomNumber}
                          </h3>
                          <Badge tone="success">Trống</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Loại phòng:</span>
                            <span className="font-medium">{room.roomType}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Sức chứa:</span>
                            <span className="font-medium">{room.capacity} người</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Giá:</span>
                            <span className="font-medium text-green-600">Miễn phí</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity, index) => (
                              <Badge key={index} tone="muted">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => {
                            setSelectedRoom(room);
                            setBookingModalOpen(true);
                          }}
                          className="w-full"
                        >
                          Đặt phòng này
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Đặt phòng</h2>
                <Button onClick={() => setBookingModalOpen(true)}>
                  Đặt phòng mới
                </Button>
              </div>
              
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardBody>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Phòng {booking.roomType}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div><span className="font-medium">Khách hàng:</span> {booking.guestName}</div>
                            <div><span className="font-medium">Email:</span> {booking.guestEmail}</div>
                            <div><span className="font-medium">SĐT:</span> {booking.phoneNumber}</div>
                            <div><span className="font-medium">Số khách:</span> {booking.guests}</div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mt-2">
                            <div><span className="font-medium">Tòa:</span> {booking.building}</div>
                            <div><span className="font-medium">Phòng:</span> {booking.roomNumber}</div>
                            <div><span className="font-medium">Check-in:</span> {booking.checkIn}</div>
                            <div><span className="font-medium">Check-out:</span> {booking.checkOut}</div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Mục đích:</span> {booking.purpose}
                          </div>
                          <div className="mt-2 text-sm text-green-600 font-medium">
                            Miễn phí
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Dịch vụ</h2>
                <Button onClick={() => setServiceModalOpen(true)}>
                  Đặt dịch vụ mới
                </Button>
              </div>
              
              <div className="grid gap-4">
                {serviceOrders.map((service) => (
                  <Card key={service.id}>
                    <CardBody>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {service.serviceName}
                            </h3>
                            {getStatusBadge(service.status)}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div><span className="font-medium">Số lượng:</span> {service.quantity}</div>
                            <div><span className="font-medium">Đơn giá:</span> {service.unitPrice.toLocaleString()} VND</div>
                            <div><span className="font-medium">Tổng tiền:</span> {service.totalPrice.toLocaleString()} VND</div>
                            <div><span className="font-medium">Đặt lúc:</span> {new Date(service.orderDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                          {service.deliveryDate && (
                            <div className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Giao hàng:</span> {new Date(service.deliveryDate).toLocaleString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Hóa đơn</h2>
              </div>
              
              <div className="grid gap-4">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardBody>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Hóa đơn #{payment.id}
                            </h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{payment.description}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                            <div><span className="font-medium">Số tiền:</span> {payment.amount.toLocaleString()} VND</div>
                            <div><span className="font-medium">Hạn thanh toán:</span> {payment.dueDate}</div>
                            {payment.paidDate && (
                              <div><span className="font-medium">Đã thanh toán:</span> {payment.paidDate}</div>
                            )}
                            {payment.paymentMethod && (
                              <div><span className="font-medium">Phương thức:</span> {payment.paymentMethod}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {payment.status === 'PENDING' && (
                            <Button 
                              onClick={() => {
                                setSelectedPayment(payment);
                                setPaymentData({ method: '', amount: payment.amount });
                                setPaymentModalOpen(true);
                              }}
                            >
                              Thanh toán
                            </Button>
                          )}
                          {payment.status === 'OVERDUE' && (
                            <Button 
                              onClick={() => {
                                setSelectedPayment(payment);
                                setPaymentData({ method: '', amount: payment.amount });
                                setPaymentModalOpen(true);
                              }}
                              variant="danger"
                            >
                              Thanh toán ngay
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Booking Modal */}
      <Modal
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedRoom(null);
        }}
        title="Đặt phòng mới"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setBookingModalOpen(false);
                setSelectedRoom(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateBooking}>
              Gửi yêu cầu đặt phòng
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedRoom && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Thông tin phòng đã chọn</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Phòng:</span> {selectedRoom.building} - {selectedRoom.roomNumber}</div>
                <div><span className="font-medium">Loại:</span> {selectedRoom.roomType}</div>
                <div><span className="font-medium">Sức chứa:</span> {selectedRoom.capacity} người</div>
                <div><span className="font-medium">Giá:</span> <span className="text-green-600 font-medium">Miễn phí</span></div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
            <Input
              type="text"
              placeholder="Nhập tên khách hàng"
              value={newBooking.guestName}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guestName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <Input
              type="email"
              placeholder="Nhập email"
              value={newBooking.guestEmail}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guestEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <Input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={newBooking.phoneNumber}
              onChange={(e) => setNewBooking(prev => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
              <Input
                type="date"
                value={newBooking.checkIn}
                onChange={(e) => setNewBooking(prev => ({ ...prev, checkIn: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
              <Input
                type="date"
                value={newBooking.checkOut}
                onChange={(e) => setNewBooking(prev => ({ ...prev, checkOut: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số khách *</label>
            <Input
              type="number"
              min="1"
              max={selectedRoom?.capacity || 10}
              value={newBooking.guests}
              onChange={(e) => setNewBooking(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
            />
            {selectedRoom && (
              <p className="text-xs text-gray-500 mt-1">Tối đa {selectedRoom.capacity} người</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mục đích sử dụng</label>
            <Input
              type="text"
              value={newBooking.purpose}
              onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
              readOnly
            />
          </div>
        </div>
      </Modal>

      {/* New Service Order Modal */}
      <Modal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title="Đặt dịch vụ mới"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setServiceModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateServiceOrder}>
              Đặt dịch vụ
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
            <Input
              type="text"
              placeholder="Nhập tên dịch vụ"
              value={newServiceOrder.serviceName}
              onChange={(e) => setNewServiceOrder(prev => ({ ...prev, serviceName: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
              <Input
                type="number"
                min="1"
                value={newServiceOrder.quantity}
                onChange={(e) => setNewServiceOrder(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá (VND) *</label>
              <Input
                type="number"
                min="0"
                value={newServiceOrder.unitPrice}
                onChange={(e) => setNewServiceOrder(prev => ({ ...prev, unitPrice: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Thanh toán hóa đơn"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => setPaymentModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handlePayment}>
              Thanh toán
            </Button>
          </div>
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Thông tin hóa đơn</h3>
              <p className="text-sm text-gray-600 mb-1">{selectedPayment.description}</p>
              <p className="text-lg font-semibold text-gray-900">
                Số tiền: {selectedPayment.amount.toLocaleString()} VND
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={paymentData.method}
                onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
              >
                <option value="">Chọn phương thức</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán *</label>
              <Input
                type="number"
                min="0"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
