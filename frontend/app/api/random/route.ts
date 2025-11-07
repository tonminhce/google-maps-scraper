import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          message: 'Database configuration error',
        },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const district = searchParams.get('district')
    const foodType = searchParams.get('food_type')
    const minRating = searchParams.get('min_rating')
    const topRated = searchParams.get('top_rated')

    const clientPromise = (await import('@/lib/mongodb')).default
    const client = await clientPromise
    const db = client.db('food')
    const collection = db.collection('hcm_food_places')

    // Build query based on filters
    const query: any = {}
    if (district) {
      query.district = district
    }
    if (foodType) {
      query.food_type = foodType
    }
    if (minRating) {
      query.reviews_average = { $gte: parseFloat(minRating) }
    }

    // Get all matching places
    let places
    if (topRated === 'true') {
      // Get top rated places (sort by rating descending, limit to top 20%)
      const allPlaces = await collection.find(query).sort({ reviews_average: -1 }).toArray()
      const topCount = Math.max(Math.ceil(allPlaces.length * 0.2), 10) // At least 10 or 20%
      places = allPlaces.slice(0, topCount)
    } else {
      places = await collection.find(query).toArray()
    }

    if (places.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Không tìm thấy quán ăn phù hợp',
      })
    }

    // Get random place
    const randomIndex = Math.floor(Math.random() * places.length)
    const randomPlace = places[randomIndex]

    return NextResponse.json({
      success: true,
      data: {
        _id: randomPlace._id.toString(),
        name: randomPlace.name,
        address: randomPlace.address,
        district: randomPlace.district,
        food_type: randomPlace.food_type,
        latitude: randomPlace.latitude,
        longitude: randomPlace.longitude,
        reviews_average: randomPlace.reviews_average || 0,
        reviews_count: randomPlace.reviews_count || 0,
        phone_number: randomPlace.phone_number || '',
        website: randomPlace.website || '',
      },
    })
  } catch (error) {
    console.error('Error fetching random place:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi tìm quán ăn',
      },
      { status: 500 }
    )
  }
}
