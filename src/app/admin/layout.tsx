import type { ReactNode } from "react";
import ConditionalLayout from "@/components/layouts/ConditionalLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConditionalLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-auto">
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </ConditionalLayout>
  );
}

