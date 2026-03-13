'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ADMIN_USER_ID } from '@/lib/admin'

function parseReviewFields(formData: FormData) {
  return {
    human_rating: parseInt(formData.get('human_rating') as string),
    human_text:   (formData.get('human_text') as string).trim(),
    dog_rating:   parseInt(formData.get('dog_rating') as string),
    dog_text:     (formData.get('dog_text') as string).trim(),
    dog_name:     ((formData.get('dog_name') as string) ?? '').trim() || null,
    dog_breed:    ((formData.get('dog_breed') as string) ?? '').trim() || null,
  }
}

export async function createReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to leave a review.' }

  const place_id = formData.get('place_id') as string
  const fields   = parseReviewFields(formData)

  if (!fields.human_text || !fields.dog_text) return { error: 'Please fill in both review fields.' }
  if (isNaN(fields.human_rating) || isNaN(fields.dog_rating)) return { error: 'Please select both ratings.' }

  const { error } = await supabase.from('reviews').insert({
    place_id,
    user_id: user.id,
    ...fields,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this place.' }
    return { error: error.message }
  }

  revalidatePath(`/places/${place_id}`)
  return { success: true }
}

export async function updateReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const id       = formData.get('id') as string
  const place_id = formData.get('place_id') as string
  const fields   = parseReviewFields(formData)

  if (!fields.human_text || !fields.dog_text) return { error: 'Please fill in both review fields.' }
  if (isNaN(fields.human_rating) || isNaN(fields.dog_rating)) return { error: 'Please select both ratings.' }

  const { error } = await supabase
    .from('reviews')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id)   // RLS + explicit check

  if (error) return { error: error.message }

  revalidatePath(`/places/${place_id}`)
  return { success: true }
}

export async function deleteReview(id: string, placeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)   // RLS + explicit check

  if (error) return { error: error.message }

  revalidatePath(`/places/${placeId}`)
  return { success: true }
}

export async function deleteReviewAsAdmin(id: string, placeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== ADMIN_USER_ID) return { error: 'Unauthorized.' }

  // No user_id check — admin RLS policy allows this
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/places/${placeId}`)
  return { success: true }
}
