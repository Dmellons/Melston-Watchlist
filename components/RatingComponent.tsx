'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SafeIcon from '@/components/SafeIcon'
import { database } from '@/lib/appwrite'
import { toast } from 'sonner'

interface RatingComponentProps {
  currentRating?: number
  currentReview?: string
  documentId: string
  mediaTitle: string
  onRatingUpdate?: (rating: number, review?: string) => void
  size?: 'sm' | 'md' | 'lg'
  showReview?: boolean
  readOnly?: boolean
}

export default function RatingComponent({
  currentRating = 0,
  currentReview = '',
  documentId,
  mediaTitle,
  onRatingUpdate,
  size = 'md',
  showReview = true,
  readOnly = false
}: RatingComponentProps) {
  const [rating, setRating] = useState(currentRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState(currentReview)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (starRating: number) => {
    if (readOnly) return
    
    const newRating = rating === starRating ? 0 : starRating
    setRating(newRating)
    
    if (!showReview) {
      handleSave(newRating, review)
    }
  }

  const handleSave = async (newRating: number = rating, newReview: string = review) => {
    setIsSaving(true)
    
    try {
      await database.updateDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        documentId,
        {
          user_rating: newRating || null,
          user_review: newReview || null,
          ...(newRating > 0 && { date_watched: new Date().toISOString() })
        }
      )

      toast.success(
        newRating > 0 
          ? `Rated "${mediaTitle}" ${newRating}/10 stars!`
          : `Removed rating for "${mediaTitle}"`
      )

      onRatingUpdate?.(newRating, newReview)
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save rating')
      console.error('Rating save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'Not rated'
    if (rating <= 2) return 'Poor'
    if (rating <= 4) return 'Fair'
    if (rating <= 6) return 'Good'
    if (rating <= 8) return 'Great'
    return 'Excellent'
  }

  const displayRating = hoverRating || rating

  if (readOnly && rating === 0) return null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Your Rating</span>
          {rating > 0 && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              {rating}/10 • {getRatingText(rating)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                className={`
                  p-1 transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed
                  ${readOnly ? 'cursor-default' : 'cursor-pointer'}
                `}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => !readOnly && setHoverRating(star)}
                onMouseLeave={() => !readOnly && setHoverRating(0)}
                disabled={readOnly || isSaving}
              >
                <SafeIcon
                  icon={Star}
                  className={`
                    ${starSizes[size]} transition-colors duration-200
                    ${star <= displayRating
                      ? 'text-amber-400 fill-current'
                      : 'text-muted-foreground hover:text-amber-300'
                    }
                  `}
                  size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
                />
              </button>
            ))}
          </div>
          
          {displayRating > 0 && (
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {displayRating}/10
            </span>
          )}
        </div>

        {/* Review Section */}
        {showReview && !readOnly && (
          <div className="space-y-3">
            {isEditing || review ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your review... (optional)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isSaving}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setReview(currentReview)
                      setRating(currentRating)
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                {currentReview ? 'Edit Review' : 'Add Review'}
              </Button>
            )}
          </div>
        )}

        {/* Display existing review */}
        {showReview && review && !isEditing && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-sm leading-relaxed">{review}</p>
            {!readOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}