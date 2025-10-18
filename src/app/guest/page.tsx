export default function GuestPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Guest Portal</h1>
        <p className="text-gray-600 mt-2">Chào mừng khách hàng đến với SORMS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏨</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Đặt phòng</h3>
              <p className="text-gray-600">Đặt phòng trực tuyến</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🛎️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Dịch vụ</h3>
              <p className="text-gray-600">Yêu cầu dịch vụ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
