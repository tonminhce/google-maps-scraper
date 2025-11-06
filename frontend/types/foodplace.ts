export interface FoodPlace {
  _id: string
  name: string
  address: string
  district: string
  food_type: string
  latitude: number
  longitude: number
  reviews_average: number
  reviews_count: number
  phone_number?: string
  website?: string
  created_at?: Date
}
