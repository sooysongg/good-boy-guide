'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PlaceCategory, NoiseLevel } from '@/lib/types'
import { ADMIN_USER_ID } from '@/lib/admin'

export async function createPlace(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be signed in to add a place.' }
  }

  const name       = formData.get('name') as string
  const address    = formData.get('address') as string
  const categories = formData.getAll('categories') as PlaceCategory[]
  const lat        = parseFloat(formData.get('lat') as string)
  const lng        = parseFloat(formData.get('lng') as string)

  if (!name || !address || categories.length === 0 || isNaN(lat) || isNaN(lng)) {
    return { error: 'Please fill in all required fields and select at least one category.' }
  }

  const category = categories[0] // primary category

  const { data: place, error: placeError } = await supabase
    .from('places')
    .insert({ name, address, lat, lng, category, categories, created_by: user.id })
    .select('id')
    .single()

  if (placeError || !place) {
    return { error: placeError?.message ?? 'Failed to create place.' }
  }

  const { error: amenityError } = await supabase
    .from('place_amenities')
    .insert({
      place_id:             place.id,
      dogs_allowed_indoors: formData.get('dogs_allowed_indoors') === 'on',
      water_bowl:           formData.get('water_bowl') === 'on',
      treats:               formData.get('treats') === 'on',
      outdoor_seating:      formData.get('outdoor_seating') === 'on',
      space_to_lie_down:    formData.get('space_to_lie_down') === 'on',
      noise_level:          (formData.get('noise_level') as NoiseLevel) ?? 'moderate',
    })

  if (amenityError) {
    // Roll back the place row if amenities fail
    await supabase.from('places').delete().eq('id', place.id)
    return { error: amenityError.message }
  }

  redirect(`/places/${place.id}`)
}

export async function updatePlaceCategoriesAsAdmin(placeId: string, categories: PlaceCategory[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) return { error: 'Unauthorized.' }
  if (categories.length === 0) return { error: 'Select at least one category.' }

  const category = categories[0]
  const { error } = await supabase
    .from('places')
    .update({ category, categories })
    .eq('id', placeId)

  if (error) return { error: error.message }
  revalidatePath(`/places/${placeId}`)
  revalidatePath('/places')
  return { success: true }
}

export async function deletePlaceAsAdmin(placeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) return { error: 'Unauthorized.' }

  // Reviews, amenities, and reports cascade-delete automatically
  const { error } = await supabase.from('places').delete().eq('id', placeId)
  if (error) return { error: error.message }

  revalidatePath('/places')
  redirect('/places')
}
