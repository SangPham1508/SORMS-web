"use client";

import type { ReactNode } from "react";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import Footer from "@/components/ui/Footer";
import { useState, useEffect } from "react";
interface ConditionalLayoutProps {
  children: ReactNode;
}

function ConditionalLayoutContent({ children }: ConditionalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true); // Sidebar visibility (show/hide)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Sidebar collapsed state (icon/full)
  // Removed SidebarContext dependency
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null>(null);

  // Load user data from localStorage
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
        setUser({ 
          name: storedName, 
          email: storedEmail || '',
          role: roleMap[storedRole as keyof typeof roleMap] || storedRole 
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Fixed on left */}
      <div className={`hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 ${!sidebarVisible ? 'lg:hidden' : ''}`}>
        <Sidebar 
          user={user || undefined} 
          isVisible={sidebarVisible}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      {/* Main Content Area - Pushed to right */}
      <div className={`lg:transition-all lg:duration-300 ${sidebarVisible ? (sidebarCollapsed ? 'lg:ml-16 xl:ml-20' : 'lg:ml-64 xl:ml-72') : 'lg:ml-0'}`}>
        {/* Header */}
        <div className="sticky top-0 z-30">
          <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        
        {/* Mobile menu button */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-3 sm:px-4 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 20a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>
        
        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-20" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs sm:max-w-sm w-full bg-white">
            <Sidebar user={user || undefined} isVisible={true} collapsed={false} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <ConditionalLayoutContent>
      {children}
    </ConditionalLayoutContent>
  );
}