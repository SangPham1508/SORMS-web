"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useBookings, useRooms } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';

export default function OfficeReportsPage() {
  const router = useRouter();
  
  // Use API hooks for data fetching
  const { data: bookingsData, loading: bookingsLoading } = useBookings();
  const { data: roomsData, loading: roomsLoading } = useRooms();
  
  // Transform API data
  const bookings = (bookingsData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
  const approvedBookings = bookings.filter((b: any) => b.status === 'APPROVED').length;
  const rejectedBookings = bookings.filter((b: any) => b.status === 'REJECTED').length;
  
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r: any) => r.status === 'OCCUPIED').length;
  const maintenanceRooms = rooms.filter((r: any) => r.status === 'MAINTENANCE').length;

  // Calculate occupancy rate
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Export to Excel
  const exportToExcel = (type: 'bookings' | 'rooms') => {
    let data: any[] = [];
    let filename = '';

    if (type === 'bookings') {
      data = bookings.map((booking: any) => ({
        'ID': booking.id,
        'Tên khách hàng': booking.guestName,
        'Email': booking.guestEmail,
        'Số điện thoại': booking.phoneNumber,
        'Tòa': booking.building,
        'Phòng': booking.roomNumber,
        'Check-in': booking.checkIn,
        'Check-out': booking.checkOut,
        'Trạng thái': booking.status === 'PENDING' ? 'Chờ duyệt' : 
                     booking.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối',
        'Ngày đặt': new Date(booking.requestDate).toLocaleDateString('vi-VN')
      }));
      filename = 'bao_cao_dat_phong.xlsx';
    } else {
      data = rooms.map((room: any) => ({
        'ID': room.id,
        'Tòa': room.building,
        'Phòng': room.number,
        'Tầng': room.floor,
        'Loại': room.type,
        'Trạng thái': room.status === 'AVAILABLE' ? 'Trống' :
                     room.status === 'OCCUPIED' ? 'Có khách' : 'Bảo trì',
        'Giá': room.price === 0 ? 'Miễn phí' : `${room.price} VND`
      }));
      filename = 'bao_cao_phong.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Xuất báo cáo và xem thống kê hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Export Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Xuất báo cáo</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => exportToExcel('bookings')}
                  variant="primary"
                  className="flex items-center justify-center p-4 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📋</span>
                    <div className="text-left">
                      <div className="font-medium">Báo cáo đặt phòng</div>
                      <div className="text-sm text-gray-500">Xuất Excel - {totalBookings} bản ghi</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => exportToExcel('rooms')}
                  variant="secondary"
                  className="flex items-center justify-center p-4 h-auto"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏠</span>
                    <div className="text-left">
                      <div className="font-medium">Báo cáo phòng</div>
                      <div className="text-sm text-gray-500">Xuất Excel - {totalRooms} phòng</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Statistics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Thống kê đặt phòng</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
                      <div className="text-sm text-gray-600">Tổng đặt phòng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
                      <div className="text-sm text-gray-600">Chờ duyệt</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{approvedBookings}</div>
                      <div className="text-sm text-gray-600">Đã duyệt</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{rejectedBookings}</div>
                      <div className="text-sm text-gray-600">Từ chối</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tỷ lệ duyệt:</span>
                      <Badge tone={approvedBookings > 0 ? "success" : "muted"}>
                        {totalBookings > 0 ? Math.round((approvedBookings / totalBookings) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Room Statistics */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Thống kê phòng</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalRooms}</div>
                      <div className="text-sm text-gray-600">Tổng phòng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
                      <div className="text-sm text-gray-600">Phòng trống</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{occupiedRooms}</div>
                      <div className="text-sm text-gray-600">Đang sử dụng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{maintenanceRooms}</div>
                      <div className="text-sm text-gray-600">Bảo trì</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tỷ lệ sử dụng:</span>
                      <Badge tone={occupancyRate > 50 ? "warning" : "success"}>
                        {occupancyRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Tóm tắt nhanh</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{totalBookings}</div>
                  <div className="text-sm text-gray-600">Tổng đặt phòng</div>
                  <div className="text-xs text-gray-500 mt-1">{pendingBookings} chờ duyệt</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{availableRooms}</div>
                  <div className="text-sm text-gray-600">Phòng trống</div>
                  <div className="text-xs text-gray-500 mt-1">{occupancyRate}% đang sử dụng</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{pendingBookings}</div>
                  <div className="text-sm text-gray-600">Cần xử lý</div>
                  <div className="text-xs text-gray-500 mt-1">Booking chờ duyệt</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

