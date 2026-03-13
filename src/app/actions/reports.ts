'use server'

import { createClient } from '@/lib/supabase/server'

export async function createReport(formData: FormData) {
  const supabase = await createClient()

  const place_id = formData.get('place_id') as string
  const reason   = (formData.get('reason') as string).trim()

  if (!reason) return { error: 'Please select a reason.' }

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('place_reports').insert({
    place_id,
    reason,
    user_id: user?.id ?? null,
  })

  if (error) return { error: error.message }
  return { success: true }
}
