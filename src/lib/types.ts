export type PlaceCategory = 'café' | 'restaurant' | 'bakery' | 'bar'
export type NoiseLevel = 'quiet' | 'moderate' | 'lively' | 'loud'

export interface User {
  id: string
  username: string
  created_at: string
}

export interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: PlaceCategory
  created_by: string
  created_at: string
}

export interface PlaceAmenities {
  id: string
  place_id: string
  dogs_allowed_indoors: boolean
  water_bowl: boolean
  treats: boolean
  outdoor_seating: boolean
  noise_level: NoiseLevel
  space_to_lie_down: boolean
}

export interface Review {
  id: string
  place_id: string
  user_id: string
  human_rating: number
  human_text: string
  dog_rating: number
  dog_text: string
  created_at: string
}

// Joined type used on the place detail page
export interface PlaceWithDetails extends Place {
  place_amenities: PlaceAmenities | null
  reviews: Review[]
}
