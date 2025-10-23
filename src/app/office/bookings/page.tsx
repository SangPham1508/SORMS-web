"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Table, THead, TBody } from "@/components/ui/Table";
import { createBookingNotification } from "@/lib/notifications";
import { useBookings } from "@/hooks/useApi";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

type BookingRequest = {
  id: number;
  guestName: string;
  guestEmail: string;
  phoneNumber: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  building: string;
  roomNumber: string;
  specialRequests?: string;
  rejectionReason?: string;
};

export default function OfficeBookingsPage() {
  const router = useRouter();
  
  // Use API hooks for data fetching
  const { data: bookingsData, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings();
  
  // Transform API data
  const bookings: BookingRequest[] = (bookingsData as any)?.data || [];

  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-hide success/error messages
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'ALL' || booking.status === filterStatus
  );

  const handleApprove = async (booking: BookingRequest) => {
    try {
      const response = await apiClient.updateBooking(booking.id, {
        ...booking,
        status: 'APPROVED'
      });
      
      if (response.success) {
        setFlash({ type: 'success', text: 'Đã duyệt đặt phòng thành công!' });
        setApprovalModalOpen(false);
        setSelectedBooking(null);
        refetchBookings();
        
        // Create notification
        createBookingNotification(
          booking.id,
          booking.guestName,
          `${booking.building} - ${booking.roomNumber}`,
          'CONFIRMED'
        );
      } else {
        setFlash({ type: 'error', text: response.error || 'Có lỗi xảy ra khi duyệt đặt phòng' });
      }
    } catch (error) {
      setFlash({ type: 'error', text: 'Có lỗi xảy ra khi duyệt đặt phòng' });
      console.error('Booking approval error:', error);
    }
  };

  const handleReject = async (booking: BookingRequest) => {
    if (!rejectionReason.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập lý do từ chối' });
      return;
    }

    try {
      const response = await apiClient.updateBooking(booking.id, {
        ...booking,
        status: 'REJECTED',
        rejectionReason
      });
      
      if (response.success) {
        setFlash({ type: 'success', text: 'Đã từ chối đặt phòng' });
        setApprovalModalOpen(false);
        setSelectedBooking(null);
        setRejectionReason('');
        refetchBookings();
        
        // Create notification
        createBookingNotification(
          booking.id,
          booking.guestName,
          `${booking.building} - ${booking.roomNumber}`,
          'REJECTED'
        );
      } else {
        setFlash({ type: 'error', text: response.error || 'Có lỗi xảy ra khi từ chối đặt phòng' });
      }
    } catch (error) {
      setFlash({ type: 'error', text: 'Có lỗi xảy ra khi từ chối đặt phòng' });
      console.error('Booking rejection error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge tone="pending">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge tone="approved">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge tone="rejected">Từ chối</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Button
                  onClick={() => router.push('/office')}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  ← Quay lại Dashboard
                </Button>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý đặt phòng</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Duyệt và quản lý các yêu cầu đặt phòng</p>
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

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="ALL">Tất cả ({bookings.length})</option>
                    <option value="PENDING">Chờ duyệt ({bookings.filter(b => b.status === 'PENDING').length})</option>
                    <option value="APPROVED">Đã duyệt ({bookings.filter(b => b.status === 'APPROVED').length})</option>
                    <option value="REJECTED">Từ chối ({bookings.filter(b => b.status === 'REJECTED').length})</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách đặt phòng ({filteredBookings.length})
              </h3>
            </CardHeader>
            <CardBody>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Không có đặt phòng nào</p>
                </div>
              ) : (
                <Table>
                  <THead>
                    <tr>
                      <th className="px-6 py-3">Khách hàng</th>
                      <th className="px-6 py-3">Phòng</th>
                      <th className="px-6 py-3">Thời gian</th>
                      <th className="px-6 py-3">Trạng thái</th>
                      <th className="px-6 py-3">Hành động</th>
                    </tr>
                  </THead>
                  <TBody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{booking.guestName}</div>
                            <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                            <div className="text-sm text-gray-500">{booking.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{booking.building} - {booking.roomNumber}</div>
                            <div className="text-sm text-gray-500">Miễn phí</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">Check-in: {booking.checkIn}</div>
                            <div className="text-sm text-gray-900">Check-out: {booking.checkOut}</div>
                            <div className="text-xs text-gray-500">Đặt lúc: {new Date(booking.requestDate).toLocaleString('vi-VN')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4">
                          {booking.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setApprovalModalOpen(true);
                                }}
                                variant="primary"
                                className="text-xs"
                              >
                                Duyệt
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setApprovalModalOpen(true);
                                }}
                                variant="danger"
                                className="text-xs"
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        open={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedBooking(null);
          setRejectionReason('');
        }}
        title={selectedBooking ? `Xử lý đặt phòng - ${selectedBooking.guestName}` : ''}
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary" 
              onClick={() => {
                setApprovalModalOpen(false);
                setSelectedBooking(null);
                setRejectionReason('');
              }}
            >
              Hủy
            </Button>
            {selectedBooking && (
              <>
                <Button 
                  variant="danger"
                  onClick={() => handleReject(selectedBooking)}
                >
                  Từ chối
                </Button>
                <Button 
                  onClick={() => handleApprove(selectedBooking)}
                >
                  Duyệt
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Thông tin đặt phòng</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Khách hàng:</span> {selectedBooking.guestName}</div>
                <div><span className="font-medium">Email:</span> {selectedBooking.guestEmail}</div>
                <div><span className="font-medium">SĐT:</span> {selectedBooking.phoneNumber}</div>
                <div><span className="font-medium">Phòng:</span> {selectedBooking.building} - {selectedBooking.roomNumber}</div>
                <div><span className="font-medium">Check-in:</span> {selectedBooking.checkIn}</div>
                <div><span className="font-medium">Check-out:</span> {selectedBooking.checkOut}</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối (nếu có)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối (nếu cần)"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

