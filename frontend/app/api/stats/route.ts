import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
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

    const clientPromise = (await import('@/lib/mongodb')).default
    const client = await clientPromise
    const db = client.db('food')
    const collection = db.collection('hcm_food_places')

    // Get total count
    const total = await collection.countDocuments()

    // Get count by district
    const byDistrict = await collection
      .aggregate([
        {
          $group: {
            _id: '$district',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            district: '$_id',
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray()

    // Get count by food type
    const byFoodType = await collection
      .aggregate([
        {
          $group: {
            _id: '$food_type',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            foodType: '$_id',
            count: 1,
            _id: 0,
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .toArray()

    // Get average rating
    const avgRatingResult = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$reviews_average' },
          },
        },
      ])
      .toArray()

    const avgRating = avgRatingResult[0]?.avgRating || 0

    // Get top rated places
    const topRated = await collection
      .find({ reviews_average: { $gt: 0 } })
      .sort({ reviews_average: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        total,
        byDistrict,
        byFoodType,
        avgRating,
        topRated: topRated.map((place) => ({
          _id: place._id.toString(),
          name: place.name,
          district: place.district,
          food_type: place.food_type,
          reviews_average: place.reviews_average,
          address: place.address,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi tải thống kê',
      },
      { status: 500 }
    )
  }
}

