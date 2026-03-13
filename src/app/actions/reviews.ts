'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createReview(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to leave a review.' }

  const place_id     = formData.get('place_id') as string
  const human_rating = parseInt(formData.get('human_rating') as string)
  const human_text   = (formData.get('human_text') as string).trim()
  const dog_rating   = parseInt(formData.get('dog_rating') as string)
  const dog_text     = (formData.get('dog_text') as string).trim()
  const dog_name     = ((formData.get('dog_name') as string) ?? '').trim() || null
  const dog_breed    = ((formData.get('dog_breed') as string) ?? '').trim() || null

  if (!human_text || !dog_text) return { error: 'Please fill in both review fields.' }
  if (isNaN(human_rating) || isNaN(dog_rating)) return { error: 'Please select both ratings.' }

  const { error } = await supabase.from('reviews').insert({
    place_id,
    user_id: user.id,
    human_rating,
    human_text,
    dog_rating,
    dog_text,
    dog_name,
    dog_breed,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this place.' }
    return { error: error.message }
  }

  revalidatePath(`/places/${place_id}`)
  return { success: true }
}
