'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'

interface Stats {
  total: number
  byDistrict: { district: string; count: number }[]
  byFoodType: { foodType: string; count: number }[]
  avgRating: number
  topRated: Array<{
    _id: string
    name: string
    district: string
    food_type: string
    reviews_average: number
    address: string
  }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
          </div>
        </main>
      </>
    )
  }

  if (!stats) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">Không thể tải thống kê</p>
          </div>
        </main>
      </>
    )
  }

  const maxDistrictCount = Math.max(...stats.byDistrict.map(d => d.count))
  const maxFoodTypeCount = Math.max(...stats.byFoodType.map(f => f.count))

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-4">
              Thống kê & Phân tích
            </h1>
            <p className="text-xl text-gray-600">
              Khám phá dữ liệu ẩm thực Sài Gòn
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold opacity-90">Tổng số quán</h3>
                <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <p className="text-5xl font-black">{stats.total.toLocaleString()}</p>
              <p className="mt-2 text-sm opacity-80">Quán ăn trong hệ thống</p>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold opacity-90">Đánh giá TB</h3>
                <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p className="text-5xl font-black">{stats.avgRating.toFixed(2)}</p>
              <p className="mt-2 text-sm opacity-80">Trên 5.0 điểm</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold opacity-90">Số quận</h3>
                <svg className="w-10 h-10 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-5xl font-black">{stats.byDistrict.length}</p>
              <p className="mt-2 text-sm opacity-80">Khu vực được phủ sóng</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* By District */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Phân bố theo quận
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stats.byDistrict
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <div key={item.district} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors">
                          {item.district}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.count} quán
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500 ease-out group-hover:shadow-lg"
                          style={{ width: `${(item.count / maxDistrictCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Food Type */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                Phân bố theo loại món
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stats.byFoodType
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => (
                    <div key={item.foodType} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-700 group-hover:text-teal-600 transition-colors">
                          {item.foodType}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.count} quán
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full transition-all duration-500 ease-out group-hover:shadow-lg"
                          style={{ width: `${(item.count / maxFoodTypeCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top Rated Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Top 10 quán đánh giá cao nhất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topRated.map((place, index) => (
                <div
                  key={place._id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-amber-400 transition-all duration-300 hover:shadow-xl flex flex-col"
                >
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 mt-2 group-hover:text-amber-600 transition-colors line-clamp-2 min-h-[3rem]">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-full border border-teal-200">
                      {place.food_type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 rounded-full border border-cyan-200">
                      {place.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                      {place.reviews_average.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2 flex-1">{place.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

