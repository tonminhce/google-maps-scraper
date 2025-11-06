'use client'

import { useState, useEffect } from 'react'
import { FoodPlace } from '@/types/foodplace'

export default function Home() {
  const [foodPlace, setFoodPlace] = useState<FoodPlace | null>(null)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'district' | 'food_type'>('all')
  const [districts, setDistricts] = useState<string[]>([])
  const [foodTypes, setFoodTypes] = useState<string[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedFoodType, setSelectedFoodType] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)
  const [topRatedOnly, setTopRatedOnly] = useState<boolean>(false)

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    try {
      const [districtsRes, foodTypesRes] = await Promise.all([
        fetch('/api/filters/districts'),
        fetch('/api/filters/food-types'),
      ])
      const districtsData = await districtsRes.json()
      const foodTypesData = await foodTypesRes.json()
      setDistricts(districtsData.districts || [])
      setFoodTypes(foodTypesData.foodTypes || [])
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const getRandomPlace = async () => {
    setLoading(true)
    try {
      let url = '/api/random'
      const params = new URLSearchParams()

      if (filterType === 'district' && selectedDistrict) {
        params.append('district', selectedDistrict)
      } else if (filterType === 'food_type' && selectedFoodType) {
        params.append('food_type', selectedFoodType)
      }

      if (minRating > 0) {
        params.append('min_rating', minRating.toString())
      }

      if (topRatedOnly) {
        params.append('top_rated', 'true')
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setFoodPlace(data.data)
      } else {
        alert('Không tìm thấy quán ăn phù hợp')
      }
    } catch (error) {
      console.error('Error fetching random place:', error)
      alert('Có lỗi xảy ra khi tìm quán ăn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 mb-2 drop-shadow-sm">
              Ăn Ăn Sài Gòn
            </h1>
          </div>
          <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
            Không biết ăn gì hôm nay? Hãy random! 
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-10 border border-gray-100 animate-slide-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Chọn cách tìm kiếm
          </h2>
          
          {/* Filter Type Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setFilterType('all')}
              className={`relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              Random toàn bộ
            </button>

            <button
              onClick={() => setFilterType('district')}
              className={`relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                filterType === 'district'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              Theo quận
            </button>

            <button
              onClick={() => setFilterType('food_type')}
              className={`relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                filterType === 'food_type'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              Theo món
            </button>
          </div>

          {/* District Filter */}
          {filterType === 'district' && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn quận:
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
              >
                <option value="">-- Chọn quận --</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Food Type Filter */}
          {filterType === 'food_type' && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn loại món:
              </label>
              <select
                value={selectedFoodType}
                onChange={(e) => setSelectedFoodType(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all bg-white"
              >
                <option value="">-- Chọn loại món --</option>
                {foodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Lọc theo đánh giá
              </label>
              <button
                onClick={() => {
                  setMinRating(0)
                  setTopRatedOnly(false)
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Xóa bộ lọc
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTopRatedOnly(true)
                  setMinRating(0)
                }}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  topRatedOnly
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                ⭐ Top Rated
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.0)
                  setTopRatedOnly(false)
                }}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  minRating === 4.0 && !topRatedOnly
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                4.0+ ⭐
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMinRating(3.5)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  minRating === 3.5 && !topRatedOnly
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                3.5+
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.5)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  minRating === 4.5 && !topRatedOnly
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                4.5+
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.8)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                  minRating === 4.8 && !topRatedOnly
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                4.8+
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={getRandomPlace}
            disabled={loading || (filterType === 'district' && !selectedDistrict) || (filterType === 'food_type' && !selectedFoodType)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-5 px-8 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang tìm kiếm...
              </span>
            ) : (
              'Tìm quán ăn ngay!'
            )}
          </button>
        </div>

        {/* Result Section */}
        {foodPlace && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-gray-100 animate-fade-in">
            {/* Restaurant Header */}
            <div className="text-center mb-10 pb-8 border-b-2 border-gray-100">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                {foodPlace.name}
              </h2>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-semibold border-2 border-orange-200">
                  {foodPlace.food_type}
                </span>
                <span className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-semibold border-2 border-red-200">
                  {foodPlace.district}
                </span>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Address */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-orange-50/30 border-2 border-gray-300">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Địa chỉ</p>
                <p className="text-lg text-gray-800 leading-relaxed font-medium">
                  {foodPlace.address}
                </p>
              </div>

              {/* Reviews */}
              {foodPlace.reviews_average > 0 && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-orange-300">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Đánh giá khách hàng</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-orange-600">
                        {foodPlace.reviews_average.toFixed(1)}
                      </span>
                      <span className="text-2xl text-gray-400 font-semibold">/ 5.0</span>
                    </div>
                    {foodPlace.reviews_count > 0 && (
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium">
                          {foodPlace.reviews_count.toLocaleString()} đánh giá
                        </p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-xl">
                              {i < Math.floor(foodPlace.reviews_average) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone */}
              {foodPlace.phone_number && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/30 border-2 border-blue-300">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Liên hệ</p>
                  <a 
                    href={`tel:${foodPlace.phone_number}`} 
                    className="text-xl text-blue-600 font-bold hover:text-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    {foodPlace.phone_number}
                    <span className="text-sm">📞</span>
                  </a>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-10 text-center">
              <button
                onClick={getRandomPlace}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Thử quán khác</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!foodPlace && !loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border border-gray-100 animate-fade-in">
            <div className="text-8xl mb-6 animate-bounce">🍜</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              Sẵn sàng khám phá món ngon?
            </h3>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Nhấn nút để bắt đầu ăn!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
