"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Table, THead, TBody } from "@/components/ui/Table";
import { useRooms } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  building: number;
  number: string;
  type: string;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  price: number;
};

export default function OfficeRoomsPage() {
  const router = useRouter();
  
  // Use API hooks for data fetching
  const { data: roomsData, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  
  // Transform API data
  const rooms: Room[] = (roomsData as any)?.data || [];

  const [roomFilter, setRoomFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('ALL');
  const [buildingFilter, setBuildingFilter] = useState<'ALL' | 1 | 2 | 3>('ALL');

  const filteredRooms = rooms.filter(room => {
    const statusMatch = roomFilter === 'ALL' || room.status === roomFilter;
    const buildingMatch = buildingFilter === 'ALL' || room.building === buildingFilter;
    return statusMatch && buildingMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge tone="available">Trống</Badge>;
      case 'OCCUPIED':
        return <Badge tone="occupied">Có khách</Badge>;
      case 'MAINTENANCE':
        return <Badge tone="maintenance">Bảo trì</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getBuildingName = (building: number) => {
    switch (building) {
      case 1: return 'Tòa A';
      case 2: return 'Tòa B';
      case 3: return 'Tòa C';
      default: return `Tòa ${building}`;
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý phòng</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Theo dõi trạng thái và quản lý phòng</p>
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
                  <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
                  <div className="text-sm text-gray-600">Tổng phòng</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {rooms.filter(r => r.status === 'AVAILABLE').length}
                  </div>
                  <div className="text-sm text-gray-600">Phòng trống</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {rooms.filter(r => r.status === 'OCCUPIED').length}
                  </div>
                  <div className="text-sm text-gray-600">Đang sử dụng</div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {rooms.filter(r => r.status === 'MAINTENANCE').length}
                  </div>
                  <div className="text-sm text-gray-600">Bảo trì</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={roomFilter} 
                    onChange={(e) => setRoomFilter(e.target.value as any)}
                  >
                    <option value="ALL">Tất cả ({rooms.length})</option>
                    <option value="AVAILABLE">Trống ({rooms.filter(r => r.status === 'AVAILABLE').length})</option>
                    <option value="OCCUPIED">Có khách ({rooms.filter(r => r.status === 'OCCUPIED').length})</option>
                    <option value="MAINTENANCE">Bảo trì ({rooms.filter(r => r.status === 'MAINTENANCE').length})</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo tòa</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={buildingFilter} 
                    onChange={(e) => setBuildingFilter(e.target.value as any)}
                  >
                    <option value="ALL">Tất cả tòa</option>
                    <option value={1}>Tòa A</option>
                    <option value={2}>Tòa B</option>
                    <option value={3}>Tòa C</option>
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Rooms Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách phòng ({filteredRooms.length})
              </h3>
            </CardHeader>
            <CardBody>
              {filteredRooms.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Không có phòng nào phù hợp</p>
                </div>
              ) : (
                <Table>
                  <THead>
                    <tr>
                      <th className="px-6 py-3">Phòng</th>
                      <th className="px-6 py-3">Tòa</th>
                      <th className="px-6 py-3">Tầng</th>
                      <th className="px-6 py-3">Loại</th>
                      <th className="px-6 py-3">Trạng thái</th>
                      <th className="px-6 py-3">Giá</th>
                    </tr>
                  </THead>
                  <TBody>
                    {filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{room.number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{getBuildingName(room.building)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">Tầng {room.floor}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{room.type}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(room.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {room.price === 0 ? 'Miễn phí' : `${room.price.toLocaleString()} VND`}
                          </div>
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
    </>
  );
}

