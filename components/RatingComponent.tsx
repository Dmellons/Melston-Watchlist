// components/RatingComponent.tsx
'use client'
import { useState, useEffect } from 'react'
import { Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { database, ID } from '@/lib/appwrite'
import { useUser } from '@/hooks/User'
import { toast } from 'sonner'
import { Query } from 'appwrite'

interface RatingComponentProps {
  tmdbId: number
  tmdbType: 'movie' | 'tv'
  mediaTitle: string
  compact?: boolean
}

interface Rating {
  $id: string
  user_id: string
  user_name: string
  tmdb_id: number
  tmdb_type: string
  rating: number
  review?: string
  created_at: string
  updated_at: string
}

interface RatingStats {
  average: number
  total: number
  distribution: { [key: number]: number }
}

export default function RatingComponent({
  tmdbId,
  tmdbType,
  mediaTitle,
  compact = false
}: RatingComponentProps) {
  const { user } = useUser()
  const [userRating, setUserRating] = useState<Rating | null>(null)
  const [allRatings, setAllRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<RatingStats>({ average: 0, total: 0, distribution: {} })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [review, setReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Load ratings on component mount
  useEffect(() => {
    loadRatings()
  }, [tmdbId, tmdbType, user])

  const loadRatings = async () => {
    try {
      setIsLoading(true)
      const ratingsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID || ''
      if (!ratingsCollectionId) {
        console.error('Ratings collection ID is not set in environment variables')
        return
      }
      
      // Get all ratings for this media
      const allRatingsResponse = await database.listDocuments(
        'watchlist', // Replace with your ratings database
        ratingsCollectionId, // You'll need to create this collection
        [
          Query.equal('tmdb_id', tmdbId),
          Query.equal('tmdb_type', tmdbType),
          Query.orderDesc('created_at'),
          Query.limit(100)
        ]
      )

      const ratings = allRatingsResponse.documents as unknown as Rating[]
      setAllRatings(ratings)

      // Calculate statistics
      if (ratings.length > 0) {
        const total = ratings.length
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0)
        const average = sum / total

        const distribution: { [key: number]: number } = {}
        for (let i = 1; i <= 10; i++) {
          distribution[i] = ratings.filter(r => r.rating === i).length
        }

        setStats({ average, total, distribution })
      }

      // Find current user's rating
      if (user) {
        const userRatingDoc = ratings.find(r => r.user_id === user.id)
        if (userRatingDoc) {
          setUserRating(userRatingDoc)
          setSelectedRating(userRatingDoc.rating)
          setReview(userRatingDoc.review || '')
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
      toast.error('Failed to load ratings')
    } finally {
      setIsLoading(false)
    }
  }

  const submitRating = async () => {
    if (!user) {
      toast.error('Please log in to rate this media')
      return
    }

    if (selectedRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const ratingData = {
        user_id: user.id!,
        user_name: user.name,
        tmdb_id: tmdbId,
        tmdb_type: tmdbType,
        media_title: mediaTitle,
        rating: selectedRating,
        review: review.trim() || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (userRating) {
        // Update existing rating (database will enforce user permissions)
        await database.updateDocument(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID,
          userRating.$id,
          {
            ...ratingData,
            created_at: userRating.created_at // Keep original creation date
          }
        )
        toast.success('Rating updated successfully!')
      } else {
        // Check if user already has a rating (in case of race condition)
        const existingRatings = await database.listDocuments(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID,
          [
            Query.equal('user_id', user.id!),
            Query.equal('tmdb_id', tmdbId),
            Query.equal('tmdb_type', tmdbType)
          ]
        )

        if (existingRatings.documents.length > 0) {
          toast.error('You have already rated this media')
          await loadRatings() // Refresh to show existing rating
          return
        }

        // Create new rating with document-level permissions
        await database.createDocument(
          'watchlist',
          process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID,
          ID.unique(),
          ratingData,
          [
            'read("any")',                    // Anyone can read this rating
            `update("user:${user.id}")`,     // Only this user can update
            `delete("user:${user.id}")`      // Only this user can delete
          ]
        )
        toast.success('Rating submitted successfully!')
      }

      // Reload ratings to update UI
      await loadRatings()
      setShowReviewForm(false)
    } catch (error) {
      console.error('Error submitting rating:', error)
      
      // Check for unique constraint violation
      if (error.message && error.message.includes('unique')) {
        toast.error('You have already rated this media')
        await loadRatings()
      } else {
        toast.error('Failed to submit rating')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteRating = async () => {
    if (!userRating || !user) return

    setIsSubmitting(true)
    try {
      // Database will enforce that only the owner can delete
      await database.deleteDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID,
        userRating.$id
      )
      
      setUserRating(null)
      setSelectedRating(0)
      setReview('')
      setShowReviewForm(false)
      await loadRatings()
      toast.success('Rating deleted successfully!')
    } catch (error) {
      console.error('Error deleting rating:', error)
      if (error.code === 401) {
        toast.error('You can only delete your own ratings')
      } else {
        toast.error('Failed to delete rating')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 transition-colors cursor-pointer ${
            star <= (interactive ? (hoveredRating || selectedRating) : stats.average)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={interactive ? () => setSelectedRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      ))}
    </div>
  )

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <StarRating />
          <span className="text-sm font-medium">
            {stats.average.toFixed(1)} ({stats.total})
          </span>
        </div>
        {user && !userRating && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowReviewForm(true)}
          >
            Rate
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Ratings & Reviews</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {stats.total} ratings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating Display */}
        {stats.total > 0 && (
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">{stats.average.toFixed(1)}</div>
            <StarRating />
            <p className="text-sm text-muted-foreground">
              Based on {stats.total} rating{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* User Rating Section */}
        {user && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">
              {userRating ? 'Your Rating' : 'Rate This Media'}
            </h3>
            
            {userRating && !showReviewForm ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= userRating.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{userRating.rating}/10</span>
                </div>
                
                {userRating.review && (
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {userRating.review}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={deleteRating}
                    disabled={isSubmitting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <StarRating interactive />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedRating > 0 ? `${selectedRating}/10` : 'Click to rate'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="review">Review (optional)</Label>
                  <Textarea
                    id="review"
                    placeholder="Share your thoughts about this media..."
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
                    {isSubmitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
                  </Button>
                  {showReviewForm && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false)
                        if (userRating) {
                          setSelectedRating(userRating.rating)
                          setReview(userRating.review || '')
                        } else {
                          setSelectedRating(0)
                          setReview('')
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Reviews */}
        {allRatings.filter(r => r.review).length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {allRatings
                .filter(r => r.review)
                .slice(0, 5)
                .map((rating) => (
                  <div key={rating.$id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{rating.user_name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{rating.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rating.review}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Please log in to rate and review this media</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}