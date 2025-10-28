"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  avatar?: string;
};

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get back URL - try to get from sessionStorage first, then fallback to role detection
  const getBackUrl = () => {
    // Try to get the previous page from sessionStorage
    const previousPage = sessionStorage.getItem('previousPage');
    if (previousPage && previousPage !== '/profile') {
      return previousPage;
    }
    
    // Fallback: detect from referrer or default to home
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer) {
        const url = new URL(referrer);
        const path = url.pathname;
        if (path.startsWith('/admin') || path.startsWith('/office') || 
            path.startsWith('/staff') || path.startsWith('/user')) {
          return path;
        }
      }
    }
    
    // Default fallback
    return '/';
  };

  // Detect user role from referrer or sessionStorage
  const getUserRole = () => {
    // Try to get from sessionStorage first
    const previousPage = sessionStorage.getItem('previousPage');
    if (previousPage) {
      if (previousPage.startsWith('/admin')) return 'admin';
      if (previousPage.startsWith('/office')) return 'office';
      if (previousPage.startsWith('/staff')) return 'staff';
      if (previousPage.startsWith('/user')) return sessionStorage.getItem('userRole') || 'user';
    }
    
    // Fallback: detect from referrer
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      if (referrer) {
        const url = new URL(referrer);
        const path = url.pathname;
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/office')) return 'office';
        if (path.startsWith('/staff')) return 'staff';
        if (path.startsWith('/user')) return sessionStorage.getItem('userRole') || 'user';
      }
    }
    
    return 'user';
  };

  const userRole = getUserRole();

  // Get profile data based on user role
  const getProfileData = (role: string): UserProfile => {
    switch (role) {
      case 'admin':
        return {
          id: 1,
          name: "Nguyễn Văn Admin",
          email: "admin@sorms.com",
          phoneNumber: "0901234567",
          position: "Quản trị viên hệ thống",
          department: "Công nghệ thông tin",
          avatar: ''
        };
      case 'office':
        return {
          id: 2,
          name: "Trần Thị Office",
          email: "office@sorms.com",
          phoneNumber: "0912345678",
          position: "Nhân viên văn phòng",
          department: "Quản lý phòng",
          avatar: ''
        };
      case 'lecturer':
        return {
          id: 3,
          name: "Lê Văn Lecturer",
          email: "lecturer@sorms.com",
          phoneNumber: "0923456789",
          position: "Giảng viên",
          department: "Khoa học máy tính",
          avatar: ''
        };
      case 'staff':
        return {
          id: 4,
          name: "Phạm Thị Staff",
          email: "staff@sorms.com",
          phoneNumber: "0934567890",
          position: "Nhân viên",
          department: "Hành chính",
          avatar: ''
        };
      case 'guest':
        return {
          id: 5,
          name: "Hoàng Văn Guest",
          email: "guest@sorms.com",
          phoneNumber: "0945678901",
          position: "Khách mời",
          department: "Khách",
          avatar: ''
        };
      default:
        return {
          id: 6,
          name: "Võ Thị User",
          email: "user@sorms.com",
          phoneNumber: "0956789012",
          position: "Người dùng",
          department: "Chung",
          avatar: ''
        };
    }
  };

  const [profile, setProfile] = useState<UserProfile>(getProfileData(userRole));
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update profile when user role changes
  useEffect(() => {
    setProfile(getProfileData(userRole));
  }, [userRole]);

  // Auto-hide success/error messages after a few seconds
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: '',
    avatar: ''
  });

  const handleEditProfile = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      position: profile.position,
      department: profile.department,
      avatar: profile.avatar || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdateProfile = () => {
    // Validation
    if (!editForm.name.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập họ và tên' });
      return;
    }

    if (!editForm.email.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập email' });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      setFlash({ type: 'error', text: 'Email không đúng định dạng' });
      return;
    }

    if (!editForm.phoneNumber.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập số điện thoại' });
      return;
    }

    // Phone number format validation (Vietnamese phone numbers)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(editForm.phoneNumber)) {
      setFlash({ type: 'error', text: 'Số điện thoại không đúng định dạng (10 số, bắt đầu bằng 0)' });
      return;
    }

    setProfile(prev => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
      phoneNumber: editForm.phoneNumber,
      position: editForm.position,
      department: editForm.department,
      avatar: editForm.avatar
    }));
    setEditModalOpen(false);
    setFlash({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1 pl-4">
              <div className="flex items-center gap-4 mb-2">
                <Button
                  onClick={() => router.push(getBackUrl())}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  Quay lại
                </Button>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                Quản lý thông tin cá nhân của bạn - {profile.position}
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

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                <Button onClick={handleEditProfile}>
                   Chỉnh sửa
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                    {profile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-gray-500">👤</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.position}</p>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <div className="text-sm text-gray-900">{profile.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="text-sm text-gray-900">{profile.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <div className="text-sm text-gray-900">{profile.phoneNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                      <div className="text-sm text-gray-900">{profile.position}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
                      <div className="text-sm text-gray-900">{profile.department}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditForm({
            name: '',
            email: '',
            phoneNumber: '',
            position: '',
            department: ''
          });
        }}
        title="Chỉnh sửa thông tin cá nhân"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateProfile}
            >
              Cập nhật
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                  !editForm.name.trim() 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập họ và tên"
                required
              />
              {!editForm.name.trim() && (
                <p className="mt-1 text-xs text-red-600">Họ và tên là bắt buộc</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                  !editForm.email.trim() || (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email))
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email (ví dụ: user@email.com)"
                required
              />
              {!editForm.email.trim() && (
                <p className="mt-1 text-xs text-red-600">Email là bắt buộc</p>
              )}
              {editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email) && (
                <p className="mt-1 text-xs text-red-600">Email không đúng định dạng</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                  !editForm.phoneNumber.trim() || (editForm.phoneNumber && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(editForm.phoneNumber))
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Nhập số điện thoại (ví dụ: 0123456789)"
                maxLength={10}
                required
              />
              {!editForm.phoneNumber.trim() && (
                <p className="mt-1 text-xs text-red-600">Số điện thoại là bắt buộc</p>
              )}
              {editForm.phoneNumber && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(editForm.phoneNumber) && (
                <p className="mt-1 text-xs text-red-600">Số điện thoại phải có 10 số, bắt đầu bằng 0</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.position}
                onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Nhập chức vụ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng ban
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.department}
                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Nhập phòng ban"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Thông tin bắt buộc
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    setEditForm(prev => ({ ...prev, avatar: String(reader.result || '') }))
                  }
                  reader.readAsDataURL(file)
                }}
                className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editForm.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editForm.avatar} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Hỗ trợ ảnh JPG, PNG. Tối đa ~2MB.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}