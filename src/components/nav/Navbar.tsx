import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/places" className="font-semibold text-lg tracking-tight">
          🐾 Good Boy Guide
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/places/new" className="text-stone-600 hover:text-stone-900">
            + Add place
          </Link>
          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-stone-600 hover:text-stone-900"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/auth/sign-in"
              className="bg-stone-900 text-white px-3 py-1.5 rounded-md hover:bg-stone-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
