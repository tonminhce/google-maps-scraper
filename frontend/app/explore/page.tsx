'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import { FoodPlace } from '@/types/foodplace'

export default function ExplorePage() {
  const [places, setPlaces] = useState<FoodPlace[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<FoodPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedFoodType, setSelectedFoodType] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'district'>('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const [districts, setDistricts] = useState<string[]>([])
  const [foodTypes, setFoodTypes] = useState<string[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSort()
  }, [places, searchQuery, selectedDistrict, selectedFoodType, minRating, sortBy])

  const fetchData = async () => {
    try {
      const [placesRes, districtsRes, foodTypesRes] = await Promise.all([
        fetch('/api/explore'),
        fetch('/api/filters/districts'),
        fetch('/api/filters/food-types'),
      ])
      
      const placesData = await placesRes.json()
      const districtsData = await districtsRes.json()
      const foodTypesData = await foodTypesRes.json()
      
      if (placesData.success) {
        setPlaces(placesData.data)
        setFilteredPlaces(placesData.data)
      }
      setDistricts(districtsData.districts || [])
      setFoodTypes(foodTypesData.foodTypes || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSort = () => {
    let filtered = [...places]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (place) =>
          place.name.toLowerCase().includes(query) ||
          place.address.toLowerCase().includes(query)
      )
    }

    // District filter
    if (selectedDistrict) {
      filtered = filtered.filter((place) => place.district === selectedDistrict)
    }

    // Food type filter
    if (selectedFoodType) {
      filtered = filtered.filter((place) => place.food_type === selectedFoodType)
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((place) => place.reviews_average >= minRating)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'vi')
      } else if (sortBy === 'rating') {
        return b.reviews_average - a.reviews_average
      } else {
        return a.district.localeCompare(b.district, 'vi')
      }
    })

    setFilteredPlaces(filtered)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedFoodType('')
    setMinRating(0)
  }

  const changePage = async (newPage: number) => {
    setPageLoading(true)
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setCurrentPage(newPage)
    setPageLoading(false)
  }

  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPlaces = filteredPlaces.slice(startIndex, endIndex)

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-4">
              Explore some food
            </h1>
            <p className="text-xl text-gray-600">
              Tìm kiếm và duyệt qua {places.length.toLocaleString()} quán ăn tại Sài Gòn
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-8 border border-gray-100">
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên quán hoặc địa chỉ..."
                className="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="">Tất cả quận</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <select
                value={selectedFoodType}
                onChange={(e) => setSelectedFoodType(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="">Tất cả loại món</option>
                {foodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 transition-all cursor-pointer"
              >
                <option value="0">Tất cả đánh giá</option>
                <option value="3.5">3.5+ sao</option>
                <option value="4.0">4.0+ sao</option>
                <option value="4.5">4.5+ sao</option>
                <option value="4.8">4.8+ sao</option>
              </select>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                  </svg>
                  Sắp xếp:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-300 focus:border-cyan-500 cursor-pointer"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="district">Theo quận</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-cyan-600 transition-colors"
                >
                  Xóa bộ lọc
                </button>
                <div className="flex gap-2 border-2 border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Tìm thấy <span className="font-bold text-cyan-600">{filteredPlaces.length}</span> kết quả
            </div>
          </div>

          <div className="relative">
            {pageLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-semibold">Đang tải...</p>
                </div>
              </div>
            )}

            {currentPlaces.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-16 text-center border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <div className={`transition-opacity duration-300 ${pageLoading ? 'opacity-30' : 'opacity-100'} ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {currentPlaces.map((place) => (
                  <div
                    key={place._id}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-cyan-400 overflow-hidden ${viewMode === 'list' ? 'flex' : 'flex flex-col'}`}
                  >
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : 'flex flex-col flex-1'}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {place.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-full text-xs font-semibold border border-teal-200">
                          {place.food_type}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 rounded-full text-xs font-semibold border border-cyan-200">
                          {place.district}
                        </span>
                      </div>

                      {place.reviews_average > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(place.reviews_average) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            ))}
                          </div>
                          <span className="text-lg font-bold text-amber-600">
                            {place.reviews_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {place.address}
                      </p>

                      <div className="mt-auto">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ', ' + place.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-center font-semibold"
                        >
                          Xem bản đồ
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => changePage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || pageLoading}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-500 hover:text-cyan-600 transition-colors font-semibold"
                  >
                    Trước
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => changePage(pageNum)}
                          disabled={pageLoading}
                          className={`w-10 h-10 rounded-lg font-bold transition-all disabled:cursor-not-allowed ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                              : 'border-2 border-gray-300 hover:border-cyan-500 hover:text-cyan-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || pageLoading}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-500 hover:text-cyan-600 transition-colors font-semibold"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </main>
    </>
  )
}

