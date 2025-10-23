"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedRoleRef = useRef("");

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Quản trị viên hệ thống SORMS', color: 'blue' },
    { id: 'office', name: 'Office', description: 'Hành chính nhà công vụ', color: 'green' },
    { id: 'lecturer', name: 'Lecturer', description: 'Giảng viên', color: 'blue' },
    { id: 'staff', name: 'Staff', description: 'Nhân viên nhà công vụ', color: 'green' },
    { id: 'guest', name: 'Guest', description: 'Khách', color: 'purple' },
  ];

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '494056341843-rfrvmaeut5kg8kbj0su2tkc7l49icuar.apps.googleusercontent.com';
        console.log('Google Client ID:', clientId);
        console.log('Current origin:', window.location.origin);
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
        });
      }
    };

    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleAuth;
    script.onerror = () => {
      setError("Không thể tải Google OAuth. Vui lòng kiểm tra kết nối mạng.");
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Render Google button when selectedRole changes
  useEffect(() => {
    console.log('🔄 useEffect triggered with selectedRole:', selectedRole);
    if (selectedRole && window.google) {
      console.log('✅ Rendering Google button for role:', selectedRole);
      const buttonDiv = document.getElementById('google-signin-button');
      if (buttonDiv) {
        buttonDiv.innerHTML = '';
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '494056341843-rfrvmaeut5kg8kbj0su2tkc7l49icuar.apps.googleusercontent.com';
        
        // Create a closure to capture the current selectedRole
        const createCallback = (role: string) => {
          return (response: any) => {
            console.log('🔐 Google callback triggered with role:', role);
            handleGoogleResponse(response, role);
          };
        };
        
        window.google.accounts.id.renderButton(buttonDiv, {
          client_id: clientId,
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          callback: createCallback(selectedRole)
        });
      }
    } else {
      console.log('❌ Cannot render Google button:', { selectedRole, googleAvailable: !!window.google });
    }
  }, [selectedRole]);

  const handleRoleSelect = (role: any) => {
    console.log('🎯 Role selected:', role.id, role.name);
    setSelectedRole(role.id);
    selectedRoleRef.current = role.id; // Also update ref
    setIsDropdownOpen(false);
    setError("");
  };

  const validateEmail = (email: string): boolean => {
    const allowedDomains = ['fpt.edu.vn', 'gmail.com'];
    const allowedEmails = ['nguyenquyen220903@gmail.com']; // Test email
    const domain = email.split('@')[1];
    
    // Allow specific test email or domain-based validation
    if (allowedEmails.includes(email)) {
      console.log('✅ Test email allowed:', email);
      return true;
    }
    
    const isValid = allowedDomains.includes(domain);
    console.log('📧 Email validation:', { email, domain, isValid });
    
    if (!isValid) {
      console.log('❌ Email not allowed. Allowed domains:', allowedDomains);
    }
    
    return isValid;
  };


  const handleGoogleResponse = (response: any, role?: string) => {
    setIsLoading(true);
    setError("");

    // Use the passed role parameter, then selectedRole state, then ref as final fallback
    const currentRole = role || selectedRole || selectedRoleRef.current;
    console.log('🔐 Google OAuth response started');
    console.log('📧 Role parameter:', role);
    console.log('📧 SelectedRole state:', selectedRole);
    console.log('📧 SelectedRole ref:', selectedRoleRef.current);
    console.log('📧 Current role (final):', currentRole);

    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;

      console.log('🔐 Google OAuth response:', { email, name, picture });
      console.log('📧 Selected role:', currentRole);

      // Validate email domain
      if (!validateEmail(email)) {
        setError("Chỉ cho phép đăng nhập bằng email @fpt.edu.vn hoặc @gmail.com");
        setIsLoading(false);
        return;
      }

      // Validate selected role before proceeding
      if (!currentRole) {
        setError("Vui lòng chọn vai trò trước khi đăng nhập.");
        setIsLoading(false);
        return;
      }

      // Store user info and role
      localStorage.setItem('userRole', currentRole);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('userPicture', picture);
      
      // Set cookies for middleware
      document.cookie = `role=${currentRole}; path=/; max-age=86400`; // 24 hours
      document.cookie = `approved=true; path=/; max-age=86400`; // 24 hours

      console.log('💾 Stored user data:', {
        role: currentRole,
        email: email,
        name: name
      });

      // Redirect based on selected role
      const redirectUrl = (() => {
        switch (currentRole) {
          case 'admin': return '/admin/dashboard';
          case 'office': return '/office/dashboard';
          case 'lecturer': return '/user/dashboard';
          case 'staff': return '/staff/dashboard';
          case 'guest': return '/user/dashboard';
          default: 
            console.error('❌ Invalid role selected:', currentRole);
            return '/';
        }
      })();

      console.log('🚀 Redirecting to:', redirectUrl);
      console.log('🍪 Cookies set:', {
        role: document.cookie.split(';').find(c => c.trim().startsWith('role=')),
        approved: document.cookie.split(';').find(c => c.trim().startsWith('approved='))
      });
      
      // Immediately redirect after successful login
      console.log('🔄 Executing immediate redirect to:', redirectUrl);
      try {
        // Force immediate redirect
        window.location.replace(redirectUrl);
      } catch (redirectError) {
        console.error('❌ Redirect failed:', redirectError);
        // Fallback to href if replace fails
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('Error processing Google response:', error);
      setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };


  const selectedRoleData = roles.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-8 space-y-8">
            {/* Logo & Title */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-gray-900">
                Chào mừng trở lại
              </h1>
              <p className="mt-2 text-gray-600">
                Đăng nhập để tiếp tục sử dụng SORMS
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Role Selection Dropdown */}
            <div className="space-y-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between py-3 px-4 border border-gray-300 rounded-md bg-white text-left hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-gray-700">
                    {selectedRoleData ? selectedRoleData.name : "VUI LÒNG CHỌN VAI TRÒ"}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && !isLoading && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-sm z-50">
                    <div className="py-1">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => handleRoleSelect(role)}
                          className="w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100"
                        >
                          {role.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Google Sign-in Button - Only show when role is selected */}
              {selectedRole && (
                <div className="space-y-2">
                  <div id="google-signin-button" className="flex justify-center"></div>
                  {isLoading && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Đang xử lý...</span>
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Back to Home */}
            <div className="text-center pt-4">
              <a 
                href="/" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Quay lại trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
