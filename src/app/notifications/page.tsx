"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

type Notification = {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: "Đặt phòng mới", 
      message: "Có 3 đặt phòng mới cần xử lý ngay. Khách hàng Nguyễn Văn A đặt phòng A101 từ 20/01/2025 đến 22/01/2025. Khách hàng Trần Thị B đặt phòng B201 từ 18/01/2025 đến 20/01/2025. Khách hàng Lê Văn C đặt phòng C301 từ 17/01/2025 đến 19/01/2025.", 
      time: "5 phút trước", 
      unread: true,
      type: 'info'
    },
    { 
      id: 2, 
      title: "Thanh toán thành công", 
      message: "Thanh toán phòng 101 đã hoàn tất thành công. Khách hàng Nguyễn Văn A đã thanh toán số tiền 1,500,000 VND bằng phương thức chuyển khoản. Giao dịch được thực hiện lúc 14:30 ngày 18/01/2025. Mã giao dịch: TXN-20250118-001.", 
      time: "1 giờ trước", 
      unread: true,
      type: 'success'
    },
    { 
      id: 3, 
      title: "Check-in hoàn tất", 
      message: "Khách đã check-in phòng 205 thành công. Khách hàng Phạm Thị D đã hoàn tất thủ tục check-in lúc 15:45 ngày 18/01/2025. Phòng đã được chuẩn bị sẵn sàng với đầy đủ tiện nghi. Nhân viên phụ trách: Nguyễn Văn E.", 
      time: "2 giờ trước", 
      unread: false,
      type: 'success'
    },
    { 
      id: 4, 
      title: "Bảo trì hệ thống", 
      message: "Hệ thống quản lý khách sạn sẽ được bảo trì từ 02:00 đến 04:00 ngày 19/01/2025. Trong thời gian này, một số tính năng có thể bị gián đoạn. Vui lòng lưu lại công việc trước khi hệ thống bảo trì. Cảm ơn sự hợp tác của bạn.", 
      time: "3 giờ trước", 
      unread: true,
      type: 'warning'
    },
    { 
      id: 5, 
      title: "Cập nhật chính sách", 
      message: "Chính sách đặt phòng và hủy phòng đã được cập nhật. Các thay đổi chính: Hủy phòng miễn phí trước 24h, phí hủy 50% trong vòng 12h, không hoàn tiền trong vòng 6h. Chính sách mới có hiệu lực từ ngày 20/01/2025.", 
      time: "1 ngày trước", 
      unread: false,
      type: 'info'
    },
    { 
      id: 6, 
      title: "Lỗi hệ thống", 
      message: "Phát hiện lỗi trong module thanh toán. Một số giao dịch có thể bị ảnh hưởng. Đội kỹ thuật đang khắc phục sự cố. Dự kiến hoàn thành trong 2 giờ tới. Vui lòng thông báo cho khách hàng về sự bất tiện này.", 
      time: "2 ngày trước", 
      unread: false,
      type: 'error'
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'type'>('time');

  const filteredNotifications = notifications
    .filter(notif => filter === 'all' || notif.unread)
    .sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      }
      return a.type.localeCompare(b.type);
    });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge tone="success">Thành công</Badge>;
      case 'warning':
        return <Badge tone="warning">Cảnh báo</Badge>;
      case 'error':
        return <Badge tone="danger">Lỗi</Badge>;
      default:
        return <Badge>Thông tin</Badge>;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Thông báo</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Quản lý và theo dõi các thông báo hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button 
              onClick={() => router.back()}
              variant="secondary"
              className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </Button>
            {unreadCount > 0 && (
              <Button 
                onClick={markAllAsRead}
                variant="secondary"
                className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Lọc</label>
            <select 
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Tất cả thông báo</option>
              <option value="unread">Chưa đọc ({unreadCount})</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <select 
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 sm:px-3 text-xs sm:text-sm w-full" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="time">Theo thời gian</option>
              <option value="type">Theo loại</option>
            </select>
          </div>
          <div></div>
          <div></div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                <p className="text-gray-500">Hiện tại không có thông báo nào phù hợp với bộ lọc của bạn.</p>
              </CardBody>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-all duration-200 ${notification.unread ? 'ring-2 ring-blue-200 bg-blue-50' : ''}`}>
                <CardBody>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                            {notification.unread && (
                              <Badge tone="success" className="text-xs">Mới</Badge>
                            )}
                            {getTypeBadge(notification.type)}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">{notification.message}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {notification.time}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.unread && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs"
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs"
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <div className="text-xs sm:text-sm text-gray-600">
              Tổng: {filteredNotifications.length} thông báo ({unreadCount} chưa đọc)
            </div>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
