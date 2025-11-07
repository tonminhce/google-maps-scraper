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
  const [isResultVisible, setIsResultVisible] = useState(false)

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
    setIsResultVisible(false)
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
        setTimeout(() => setIsResultVisible(true), 100)
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
    <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <div className="inline-block mb-4 sm:mb-6">
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-2 drop-shadow-sm animate-gradient">
                Ăn Ăn Sài Gòn
              </h1>
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-3xl sm:text-4xl animate-float">
                🍜
              </div>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-700 font-medium max-w-2xl mx-auto leading-relaxed">
            Không biết ăn gì hôm nay?{' '}
            <span className="text-cyan-600 font-bold">Hãy random!</span>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full border border-gray-300 shadow-sm">
              <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Sài Gòn
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full border border-gray-300 shadow-sm">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Ẩm thực đường phố
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 sm:mb-10 border border-slate-200 animate-slide-in hover:shadow-3xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              Chọn cách tìm kiếm
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => setFilterType('all')}
              className={`group relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-cyan-400 hover:shadow-md'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
                Random toàn bộ
              </span>
            </button>

            <button
              onClick={() => setFilterType('district')}
              className={`group relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterType === 'district'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-cyan-400 hover:shadow-md'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Theo quận
              </span>
            </button>

            <button
              onClick={() => setFilterType('food_type')}
              className={`group relative px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filterType === 'food_type'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-cyan-400 hover:shadow-md'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                Theo món
              </span>
            </button>
          </div>

          {filterType === 'district' && (
            <div className="mb-6 animate-fade-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Chọn quận:
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-5 py-3.5 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all bg-white appearance-none cursor-pointer hover:border-cyan-400"
                >
                  <option value="">-- Chọn quận --</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {filterType === 'food_type' && (
            <div className="mb-6 animate-fade-in">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                Chọn loại món:
              </label>
              <div className="relative">
                <select
                  value={selectedFoodType}
                  onChange={(e) => setSelectedFoodType(e.target.value)}
                  className="w-full px-5 py-3.5 text-base border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all bg-white appearance-none cursor-pointer hover:border-cyan-400"
                >
                  <option value="">-- Chọn loại món --</option>
                  {foodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Lọc theo đánh giá
              </label>
              <button
                onClick={() => {
                  setMinRating(0)
                  setTopRatedOnly(false)
                }}
                className="text-xs text-slate-500 hover:text-cyan-600 font-medium transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Xóa bộ lọc
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setTopRatedOnly(true)
                  setMinRating(0)
                }}
                className={`group px-4 py-3 rounded-xl font-medium text-sm transition-all transform hover:scale-105 active:scale-95 ${
                  topRatedOnly
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-amber-300'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Top Rated
                </span>
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.0)
                  setTopRatedOnly(false)
                }}
                className={`group px-4 py-3 rounded-xl font-medium text-sm transition-all transform hover:scale-105 active:scale-95 ${
                  minRating === 4.0 && !topRatedOnly
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-amber-300'
                }`}
              >
                4.0+
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMinRating(3.5)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all transform hover:scale-105 active:scale-95 ${
                  minRating === 3.5 && !topRatedOnly
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200 hover:border-teal-300'
                }`}
              >
                3.5+
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.5)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all transform hover:scale-105 active:scale-95 ${
                  minRating === 4.5 && !topRatedOnly
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200 hover:border-teal-300'
                }`}
              >
                4.5+
              </button>
              
              <button
                onClick={() => {
                  setMinRating(4.8)
                  setTopRatedOnly(false)
                }}
                className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all transform hover:scale-105 active:scale-95 ${
                  minRating === 4.8 && !topRatedOnly
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-white border border-slate-200 hover:border-teal-300'
                }`}
              >
                4.8+
              </button>
            </div>
          </div>

          <button
            onClick={getRandomPlace}
            disabled={loading || (filterType === 'district' && !selectedDistrict) || (filterType === 'food_type' && !selectedFoodType)}
            className="group relative w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-8 rounded-xl hover:shadow-2xl hover:shadow-cyan-300/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none text-lg overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Đang tìm kiếm món ngon...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Tìm quán ăn ngay!
                </span>
              )}
            </span>
          </button>
        </div>

        {foodPlace && (
          <div className={`bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100 transition-all duration-700 ${isResultVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="text-center mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-slate-100">
              <div className="mb-3 inline-block">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-full shadow-sm">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  ĐÃ TÌM THẤY
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
                {foodPlace.name}
              </h2>
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-full font-semibold border-2 border-teal-200 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                  {foodPlace.food_type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 rounded-full font-semibold border-2 border-cyan-200 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {foodPlace.district}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border-2 border-slate-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg">
                <p className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  Địa chỉ
                </p>
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">
                  {foodPlace.address}
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodPlace.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Xem trên Google Maps
                </a>
              </div>

              {foodPlace.reviews_average > 0 && (
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-lg">
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Đánh giá khách hàng
                  </p>
                  <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600">
                        {foodPlace.reviews_average.toFixed(1)}
                      </span>
                      <span className="text-xl sm:text-2xl text-slate-400 font-semibold">/ 5.0</span>
                    </div>
                    {foodPlace.reviews_count > 0 && (
                      <div className="flex-1 min-w-[150px]">
                        <p className="text-sm text-slate-600 font-medium mb-2">
                          {foodPlace.reviews_count.toLocaleString()} đánh giá
                        </p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < Math.floor(foodPlace.reviews_average) ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {foodPlace.phone_number && (
                <div className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/30 border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    Liên hệ
                  </p>
                  <a 
                    href={`tel:${foodPlace.phone_number}`} 
                    className="text-lg sm:text-xl text-indigo-600 font-bold hover:text-indigo-700 transition-colors inline-flex items-center gap-2 group"
                  >
                    <span>{foodPlace.phone_number}</span>
                    <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={getRandomPlace}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full hover:shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>Thử quán khác</span>
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${foodPlace.latitude},${foodPlace.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold py-4 px-8 rounded-full hover:shadow-2xl hover:shadow-teal-300/50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                <span>Chỉ đường</span>
              </a>
            </div>
          </div>
        )}

        {!foodPlace && !loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 sm:p-16 text-center border border-gray-100 animate-fade-in hover:shadow-3xl transition-shadow duration-300">
            <div className="text-7xl sm:text-8xl mb-6 animate-bounce inline-block">🍜</div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Sẵn sàng khám phá món ngon?
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto mb-6">
              Chọn bộ lọc phía trên và nhấn nút tìm kiếm để khám phá những quán ăn tuyệt vời tại Sài Gòn!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Đánh giá cao
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
                Được yêu thích
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
