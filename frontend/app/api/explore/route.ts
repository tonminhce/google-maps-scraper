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

    const places = await collection
      .find({})
      .sort({ reviews_average: -1 })
      .limit(1000)
      .toArray()

    return NextResponse.json({
      success: true,
      data: places.map((place) => ({
        _id: place._id.toString(),
        name: place.name,
        address: place.address,
        district: place.district,
        food_type: place.food_type,
        latitude: place.latitude,
        longitude: place.longitude,
        reviews_average: place.reviews_average || 0,
        reviews_count: place.reviews_count || 0,
        phone_number: place.phone_number || '',
      })),
    })
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi tải dữ liệu',
      },
      { status: 500 }
    )
  }
}

