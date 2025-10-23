import Link from "next/link";

export default function HomePage() {
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
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-white font-bold text-4xl">S</span>
          </div>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Nhà Công Vụ Thông Minh
          <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SORMS
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Hệ thống quản lý nhà công vụ thông minh, giúp bạn quản lý phòng, dịch vụ và thanh toán 
          một cách hiệu quả và chuyên nghiệp.
        </p>
        {/* CTA Button */}
<Link
  href="/login"
  className="group relative px-10 py-4 border-2 border-blue-600 text-blue-600 font-semibold text-lg rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
>
  <span className="relative z-10 group-hover:text-white transition-colors duration-300">
    Đăng nhập ngay
  </span>
  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
</Link>
      </div>
    </div>
  );
}
