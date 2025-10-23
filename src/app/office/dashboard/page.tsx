"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useBookings, useRooms } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

export default function OfficeDashboard() {
  const router = useRouter();
  
  // Set user role in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userRole', 'office');
    }
  }, []);

  // Use API hooks for data fetching
  const { data: bookingsData, loading: bookingsLoading } = useBookings();
  const { data: roomsData, loading: roomsLoading } = useRooms();

  // Transform API data
  const bookings = (bookingsData as any)?.data || [];
  const rooms = (roomsData as any)?.data || [];

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING').length;
  const approvedBookings = bookings.filter((b: any) => b.status === 'APPROVED').length;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r: any) => r.status === 'AVAILABLE').length;
  const occupiedRooms = rooms.filter((r: any) => r.status === 'OCCUPIED').length;
  const maintenanceRooms = rooms.filter((r: any) => r.status === 'MAINTENANCE').length;

  // Quick actions
  const quickActions = [
    {
      title: "Duyệt đặt phòng",
      description: `${pendingBookings} yêu cầu chờ duyệt`,
      icon: "📋",
      onClick: () => router.push('/office/bookings'),
      variant: "primary" as const
    },
    {
      title: "Quản lý phòng",
      description: `${availableRooms} phòng trống`,
      icon: "🏠",
      onClick: () => router.push('/office/rooms'),
      variant: "secondary" as const
    },
    {
      title: "Báo cáo",
      description: "Xuất báo cáo thống kê",
      icon: "📊",
      onClick: () => router.push('/office/reports'),
      variant: "secondary" as const
    },
    {
      title: "Thông báo",
      description: "Gửi thông báo hệ thống",
      icon: "🔔",
      onClick: () => router.push('/notifications'),
      variant: "ghost" as const
    }
  ];

  // No mocked recent activities. Show only API-derived stats and quick actions.

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Văn phòng</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Tổng quan hệ thống quản lý phòng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
                  <div className="text-sm text-gray-600">Tổng đặt phòng</div>
                  <div className="text-xs text-gray-500">{pendingBookings} chờ duyệt</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
                  <div className="text-sm text-gray-600">Phòng trống</div>
                  <div className="text-xs text-gray-500">{occupiedRooms} đang sử dụng</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
                  <div className="text-sm text-gray-600">Chờ duyệt</div>
                  <div className="text-xs text-gray-500">{approvedBookings} đã duyệt</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{maintenanceRooms}</div>
                  <div className="text-sm text-gray-600">Bảo trì</div>
                  <div className="text-xs text-gray-500">Cần xử lý</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Hành động nhanh</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    onClick={action.onClick}
                    className="flex items-center justify-start p-4 h-auto text-left"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0 text-2xl">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Tip: Thêm biểu đồ/summary thật từ API khi backend sẵn sàng */}
        </div>
      </div>
    </>
  );
}