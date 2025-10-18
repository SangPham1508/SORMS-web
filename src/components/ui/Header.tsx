"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";
import Input from "./Input";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Removed SidebarContext dependency - sidebar now manages its own state
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "Đặt phòng mới", 
      message: "Có 3 đặt phòng mới cần xử lý ngay. Khách hàng Nguyễn Văn A đặt phòng A101 từ 20/01/2025 đến 22/01/2025. Khách hàng Trần Thị B đặt phòng B201 từ 18/01/2025 đến 20/01/2025. Khách hàng Lê Văn C đặt phòng C301 từ 17/01/2025 đến 19/01/2025.", 
      time: "5 phút trước", 
      unread: true 
    },
    { 
      id: 2, 
      title: "Thanh toán thành công", 
      message: "Thanh toán phòng 101 đã hoàn tất thành công. Khách hàng Nguyễn Văn A đã thanh toán số tiền 1,500,000 VND bằng phương thức chuyển khoản. Giao dịch được thực hiện lúc 14:30 ngày 18/01/2025. Mã giao dịch: TXN-20250118-001.", 
      time: "1 giờ trước", 
      unread: true 
    },
    { 
      id: 3, 
      title: "Check-in hoàn tất", 
      message: "Khách đã check-in phòng 205 thành công. Khách hàng Phạm Thị D đã hoàn tất thủ tục check-in lúc 15:45 ngày 18/01/2025. Phòng đã được chuẩn bị sẵn sàng với đầy đủ tiện nghi. Nhân viên phụ trách: Nguyễn Văn E.", 
      time: "2 giờ trước", 
      unread: false 
    },
    { 
      id: 4, 
      title: "Bảo trì hệ thống", 
      message: "Hệ thống quản lý khách sạn sẽ được bảo trì từ 02:00 đến 04:00 ngày 19/01/2025. Trong thời gian này, một số tính năng có thể bị gián đoạn. Vui lòng lưu lại công việc trước khi hệ thống bảo trì. Cảm ơn sự hợp tác của bạn.", 
      time: "3 giờ trước", 
      unread: true 
    },
    { 
      id: 5, 
      title: "Cập nhật chính sách", 
      message: "Chính sách đặt phòng và hủy phòng đã được cập nhật. Các thay đổi chính: Hủy phòng miễn phí trước 24h, phí hủy 50% trong vòng 12h, không hoàn tiền trong vòng 6h. Chính sách mới có hiệu lực từ ngày 20/01/2025.", 
      time: "1 ngày trước", 
      unread: false 
    },
  ]);
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = pathname.startsWith('/admin');
  const isOffice = pathname.startsWith('/office');
  const isLecturer = pathname.startsWith('/lecturer');
  const isStaff = pathname.startsWith('/staff');
  const isGuest = pathname.startsWith('/guest');
  
  // Check if user is logged in (on protected pages)
  const isLoggedIn = isAdmin || isOffice || isLecturer || isStaff || isGuest;

  // Auto-detect user role based on path and localStorage
  const [detectedUser, setDetectedUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      const storedEmail = localStorage.getItem('userEmail');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedName && storedRole) {
        const roleMap = {
          'admin': 'Administrator',
          'office': 'Office Staff', 
          'lecturer': 'Lecturer',
          'staff': 'Staff',
          'guest': 'Guest'
        };
        setDetectedUser({ 
          name: storedName, 
          email: storedEmail || '',
          role: roleMap[storedRole as keyof typeof roleMap] || storedRole 
        });
      } else {
        // Fallback to path-based detection
        if (isAdmin) setDetectedUser({ name: "Admin User", email: "admin@sorms.com", role: "Administrator" });
        else if (isOffice) setDetectedUser({ name: "Office Staff", email: "office@sorms.com", role: "Office Staff" });
        else if (isLecturer) setDetectedUser({ name: "Lecturer", email: "lecturer@sorms.com", role: "Lecturer" });
        else if (isStaff) setDetectedUser({ name: "Staff Member", email: "staff@sorms.com", role: "Staff" });
        else if (isGuest) setDetectedUser({ name: "Guest User", email: "guest@sorms.com", role: "Guest" });
      }
    }
  }, [isAdmin, isOffice, isLecturer, isStaff, isGuest]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-menu]')) {
        setProfileMenuOpen(false);
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't render header on public pages (not logged in)
  if (!isLoggedIn) {
    return null;
  }

  // Show loading state while detecting user
  if (!detectedUser) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
      // You can add search logic here
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPicture');
    
    // Clear cookies
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'approved=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    router.push('/login');
  };

  // Mark notification as read and navigate to notifications page
  const handleNotificationClick = (id: number) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
    
    // Close notification dropdown
    setNotificationMenuOpen(false);
    
    // Navigate to notifications page
    router.push('/notifications');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Sidebar Toggle */}
          <div className="flex items-center">
            {/* Sidebar Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 20a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z" />
              </svg>
            </button>

            {/* Logo */}
            <Link
              href={isAdmin ? "/admin" : isOffice ? "/office" : isLecturer ? "/lecturer" : isStaff ? "/staff" : isGuest ? "/guest" : "/"}
              className="flex items-center space-x-2 sm:space-x-3 ml-3 sm:ml-6"
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-xs sm:text-sm">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-semibold text-gray-900">SORMS</span>
                <span className="text-xs text-gray-500 hidden sm:block">Smart Office</span>
              </div>
            </Link>
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Notifications */}
            <div className="relative" data-menu>
              <Button 
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
                variant="ghost"
                className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md relative"
              >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" />
              </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {notificationMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md border border-gray-300 z-50 shadow-lg">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{unreadCount} mới</span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-semibold text-gray-900 leading-tight">{notification.title}</p>
                              {notification.unread && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-normal break-words">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                        <p className="text-sm">Không có thông báo nào</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <Button 
                      variant="ghost" 
                      className="w-full text-center text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => {
                        setNotificationMenuOpen(false);
                        router.push('/notifications');
                      }}
                    >
                      Xem tất cả thông báo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            {detectedUser && (
              <div className="relative" data-menu>
                <Button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  variant="ghost"
                  className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-100 rounded-md p-1.5 sm:p-2"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-700 text-xs sm:text-sm font-medium">
                      {detectedUser.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {detectedUser.name}
                    </div>
                    <div className="text-xs text-gray-500">{detectedUser.role}</div>
                  </div>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {/* Profile Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md border border-gray-300 z-50">
                    {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-700 font-medium">
                            {detectedUser.name?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{detectedUser.name}</div>
                          <div className="text-xs text-gray-500 truncate">{detectedUser.email}</div>
                          <div className="text-xs text-gray-600 font-medium">{detectedUser.role}</div>
                        </div>
                      </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                      <Button variant="ghost" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 justify-start">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        <span>Hồ sơ cá nhân</span>
                      </Button>
                      </div>

                      {/* Logout */}
                    <div className="border-t border-gray-100">
                      <Button 
                        onClick={handleLogout}
                        variant="ghost"
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 justify-start"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        <span>Đăng xuất</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
