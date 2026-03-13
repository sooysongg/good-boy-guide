import PlaceForm from '@/components/places/PlaceForm'
import Link from 'next/link'

export const metadata = { title: 'Add a place — Good Boy Guide' }

export default function NewPlacePage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/places" className="text-sm text-stone-500 hover:text-stone-700">
          ← Back to places
        </Link>
        <h1 className="text-2xl font-bold mt-3">Add a place</h1>
        <p className="text-sm text-stone-500 mt-1">
          Know a dog-friendly spot in Oslo? Add it to the guide.
        </p>
      </div>
      <PlaceForm />
    </div>
  )
}
