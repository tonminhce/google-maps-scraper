import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('food')
    const collection = db.collection('hcm_food_places')

    // Get distinct districts
    const districts = await collection.distinct('district')

    return NextResponse.json({
      success: true,
      districts: districts.filter(Boolean).sort(),
    })
  } catch (error) {
    console.error('Error fetching districts:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Có lỗi xảy ra khi tải danh sách quận',
      },
      { status: 500 }
    )
  }
}
