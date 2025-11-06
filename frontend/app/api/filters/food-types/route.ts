import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('food')
    const collection = db.collection('hcm_food_places')

    // Get distinct food types
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
