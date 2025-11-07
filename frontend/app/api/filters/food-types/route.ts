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

    const foodTypes = await collection.distinct('food_type')

    return NextResponse.json({
      success: true,
      foodTypes: foodTypes.filter(Boolean).sort(),
    })
  } catch (error) {
    console.error('Error fetching food types:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi tải danh sách loại món',
      },
      { status: 500 }
    )
  }
}
