'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { database } from '@/lib/appwrite'
import { toast } from 'sonner'

interface WatchlistRatingCardProps {
  currentRating: number
  currentReview: string
  documentId: string
  mediaTitle: string
  onRatingUpdate?: () => void
}

export default function WatchlistRatingCard({
  currentRating,
  currentReview,
  documentId,
  mediaTitle,
  onRatingUpdate
}: WatchlistRatingCardProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(currentRating)
  const [review, setReview] = useState(currentReview)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(currentRating === 0)

  const submitRating = async () => {
    if (selectedRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      await database.updateDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        documentId,
        {
          rating: selectedRating,
          user_review: review.trim() || null,
          date_watched: new Date().toISOString()
        }
      )

      toast.success(`Rated "${mediaTitle}" ${selectedRating}/10`)
      setIsEditing(false)
      onRatingUpdate?.()
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to save rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearRating = async () => {
    setIsSubmitting(true)

    try {
      await database.updateDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        documentId,
        {
          rating: null,
          user_review: null
        }
      )

      setSelectedRating(0)
      setReview('')
      setIsEditing(true)
      toast.success('Rating removed')
      onRatingUpdate?.()
    } catch (error) {
      console.error('Error clearing rating:', error)
      toast.error('Failed to remove rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            star <= (interactive ? (hoveredRating || selectedRating) : selectedRating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
          onClick={interactive ? () => setSelectedRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      ))}
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Rating</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && selectedRating > 0 ? (
          // Display mode
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StarRating />
              <span className="font-bold text-lg">{selectedRating}/10</span>
            </div>

            {review && (
              <p className="text-sm bg-muted p-3 rounded-lg">{review}</p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearRating}
                disabled={isSubmitting}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          // Edit mode
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                {selectedRating > 0 ? `${selectedRating}/10` : 'Click to rate'}
              </Label>
              <StarRating interactive />
            </div>

            <div>
              <Label htmlFor="review" className="text-sm">Review (optional)</Label>
              <Textarea
                id="review"
                placeholder="Share your thoughts..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={submitRating}
                disabled={selectedRating === 0 || isSubmitting}
              >
                {isSubmitting ? 'Saving...' : currentRating > 0 ? 'Update' : 'Save Rating'}
              </Button>
              {currentRating > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRating(currentRating)
                    setReview(currentReview)
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
