"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

// Context7 MCP inspired: Global Google OAuth cache
let googleAuthInitialized = false;
let googleAuthPromise: Promise<void> | null = null;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedRoleRef = useRef("");

  // Context7 MCP: Memoized roles for performance
  const roles = useMemo(() => [
    { id: "admin", name: "Admin" },
    { id: "office", name: "Phòng Hành chính" },
    { id: "lecturer", name: "Giảng viên" },
    { id: "staff", name: "Nhân viên" },
    { id: "guest", name: "Khách mời" },
  ], []);

  // Context7 MCP: Optimized Google OAuth initialization with caching
  const initializeGoogleAuth = useCallback(async () => {
    if (googleAuthInitialized) return;
    
    if (googleAuthPromise) {
      return googleAuthPromise;
    }

    googleAuthPromise = new Promise((resolve, reject) => {
        const initializeAuth = () => {
          if (window.google) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                            "494056341843-rfrvmaeut5kg8kbj0su2tkc7l49icuar.apps.googleusercontent.com";
            
            console.log("Google Client ID:", clientId ? "Found" : "Not found");
            console.log("Using Client ID:", clientId.substring(0, 20) + "...");
            
            if (!clientId) {
              reject(new Error("Google Client ID not configured in environment variables"));
              return;
            }

          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleResponse,
            });
            googleAuthInitialized = true;
            console.log("Google OAuth initialized successfully");
            resolve();
          } catch (error) {
            reject(new Error(`Google OAuth initialization failed: ${error}`));
          }
        } else {
          reject(new Error("Google OAuth library not loaded"));
        }
      };

      if (window.google) {
        initializeAuth();
      } else {
        console.log("Loading Google OAuth script...");
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google OAuth script loaded");
          initializeAuth();
        };
        script.onerror = () => {
          console.error("Failed to load Google OAuth script");
          reject(new Error("Failed to load Google OAuth script from CDN"));
        };
        document.head.appendChild(script);
      }
    });

    return googleAuthPromise;
  }, []);

  // Context7 MCP: Optimized useEffect with proper dependencies
  useEffect(() => {
    initializeGoogleAuth().catch((err) => {
      console.error("Google OAuth initialization error:", err);
      setError("Không thể tải Google OAuth. Vui lòng kiểm tra kết nối mạng và thử lại.");
    });
  }, [initializeGoogleAuth]);

  // Context7 MCP: Optimized Google button rendering
  useEffect(() => {
    if (selectedRole && window.google && googleAuthInitialized) {
      const buttonDiv = document.getElementById("google-signin-button");
      if (buttonDiv) {
        buttonDiv.innerHTML = "";
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                        "494056341843-rfrvmaeut5kg8kbj0su2tkc7l49icuar.apps.googleusercontent.com";
        
        console.log("Google Client ID:", clientId ? "Found" : "Not found");
        
        if (!clientId) {
          console.error("Google Client ID not configured in environment variables");
          return;
        }

        const createCallback = (role: string) => {
          return (response: any) => {
            handleGoogleResponse(response, role);
          };
        };

        window.google.accounts.id.renderButton(buttonDiv, {
          client_id: clientId,
          theme: "outline",
          size: "large",
          width: 300,
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          callback: createCallback(selectedRole),
        });
      }
    }
  }, [selectedRole]);

  const handleRoleSelect = useCallback((role: any) => {
    setSelectedRole(role.id);
    selectedRoleRef.current = role.id;
    setIsDropdownOpen(false);
    setError("");
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    const allowedDomains = ["fpt.edu.vn", "gmail.com"];
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
  }, []);

  // Context7 MCP: Async storage operations with parallel processing
  const saveUserData = useCallback(async (userData: any) => {
    const operations = [
      () => localStorage.setItem("userRole", userData.role),
      () => localStorage.setItem("isLoggedIn", "true"),
      () => localStorage.setItem("userEmail", userData.email),
      () => localStorage.setItem("userName", userData.name),
      () => localStorage.setItem("userPicture", userData.picture),
      () => {
        document.cookie = `role=${userData.role}; path=/; max-age=86400`;
        document.cookie = `approved=true; path=/; max-age=86400`;
      }
    ];

    // Execute all operations in parallel
    await Promise.all(operations.map(op => Promise.resolve(op())));
  }, []);

  // Context7 MCP: Intelligent prefetching based on role
  const prefetchDashboard = useCallback((role: string) => {
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      office: "/office/dashboard", 
      lecturer: "/user/dashboard",
      guest: "/user/dashboard",
      staff: "/staff/dashboard"
    };
    
    const route = dashboardRoutes[role as keyof typeof dashboardRoutes];
    if (route) {
      // Prefetch the dashboard route
      router.prefetch(route);
    }
  }, [router]);

  const handleGoogleResponse = useCallback(async (response: any, role?: string) => {
    setIsLoading(true);
    setError("");

    const currentRole = role || selectedRole || selectedRoleRef.current;

    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;

      if (!validateEmail(email)) {
        setError("Chỉ cho phép đăng nhập bằng email @fpt.edu.vn hoặc @gmail.com");
        setIsLoading(false);
        return;
      }

      if (!currentRole) {
        setError("Vui lòng chọn vai trò trước khi đăng nhập.");
        setIsLoading(false);
        return;
      }

      // Context7 MCP: Parallel data saving and prefetching
      const userData = { role: currentRole, email, name, picture };
      
      // Save data and prefetch dashboard in parallel
      await Promise.all([
        saveUserData(userData),
        prefetchDashboard(currentRole)
      ]);

      // Context7 MCP: Intelligent navigation with Next.js router
      const redirectUrl = (() => {
        switch (currentRole) {
          case "admin":
            return "/admin/dashboard";
          case "office":
            return "/office/dashboard";
          case "lecturer":
          case "guest":
            return "/user/dashboard";
          case "staff":
            return "/staff/dashboard";
          default:
            return "/";
        }
      })();

      // Use Next.js router for client-side navigation
      router.push(redirectUrl);
    } catch (error) {
      setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
      setIsLoading(false);
    }
  }, [selectedRole, validateEmail, saveUserData, prefetchDashboard, router]);

  const selectedRoleData = useMemo(() => 
    roles.find((role) => role.id === selectedRole), 
    [roles, selectedRole]
  );

  return (
    <div className="min-h-screen relative overflow-hidden font-[Inter]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://cdn.tienphong.vn/images/814b5533c866dc3540018a126103e935e41e658c37f7e8dcbdb6292ed05c91a360f30cb27834f97679b7241f77c48cc540bbcbd3a527fa3765766ab79535fdcf/image003-7518-2471.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 space-y-4">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl tracking-tight">
                S
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chào mừng trở lại 👋
            </h1>
            <p className="text-gray-600 text-base">
              Đăng nhập để tiếp tục sử dụng <span className="font-semibold">SORMS</span>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 font-medium animate-in fade-in slide-in-from-top-1">
              ⚠️ {error}
            </div>
          )}

          {/* Role dropdown */}
          <div className="relative flex justify-center">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="w-[300px] flex items-center justify-between py-2 px-3 border border-gray-300 rounded-lg bg-white text-left hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-11 transition-all duration-200 shadow-sm"
            >
              <span className="text-gray-700 text-sm font-medium">
                {selectedRoleData
                  ? selectedRoleData.name
                  : "VUI LÒNG CHỌN VAI TRÒ"}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && !isLoading && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[300px] mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="py-1">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full text-left py-2 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors duration-150 text-sm"
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Google button */}
          {selectedRole && (
            <div className="space-y-3">
              <div id="google-signin-button" className="flex justify-center" />
              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600 font-medium">
                    Đang xử lý...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Context7 MCP: Optimized back link with Next.js router */}
          <div className="text-center pt-4">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:underline"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
