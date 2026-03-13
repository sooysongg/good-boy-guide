interface Props {
  review: {
    id: string
    human_rating: number
    human_text: string
    dog_rating: number
    dog_text: string
    created_at: string
    users: { username: string } | null
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(rating)}
      <span className="text-stone-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function ReviewCard({ review }: Props) {
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">
          {review.users?.username ?? 'Anonymous'}
        </span>
        <span className="text-stone-400">{date}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-stone-500 text-xs uppercase tracking-wide">Human</span>
            <Stars rating={review.human_rating} />
          </div>
          <p className="text-stone-700">{review.human_text}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-stone-500 text-xs uppercase tracking-wide">Dog</span>
            <Stars rating={review.dog_rating} />
          </div>
          <p className="text-stone-700">{review.dog_text}</p>
        </div>
      </div>
    </div>
  )
}
