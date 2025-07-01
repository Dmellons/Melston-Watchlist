// lib/services/ratingsService.ts - Service for the modified ratings collection
import { database, ID, Permission, Role } from "@/lib/appwrite";
import { WatchStatus } from "@/types/customTypes";

export interface RatingDocument {
    $id: string;
    user_id: string;
    user_name: string;
    tmdb_id: number;
    tmdb_type: string;
    media_title: string;
    rating: number;
    review?: string;
    watch_status: WatchStatus;
    date_watched?: string;
    rewatch_count: number;
    is_favorite: boolean;
    tags: string[];
    progress_data?: {
        current_episode?: number;
        total_episodes?: number;
        current_season?: number;
        total_seasons?: number;
        last_watched_date?: string;
    };
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateRatingData {
    user_id: string;
    user_name: string;
    tmdb_id: number;
    tmdb_type: string;
    media_title: string;
    rating?: number;
    review?: string;
    watch_status?: WatchStatus;
    date_watched?: string;
    rewatch_count?: number;
    is_favorite?: boolean;
    tags?: string[];
    progress_data?: RatingDocument['progress_data'];
    notes?: string;
}

export class RatingsService {
    static readonly COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RATINGS_COLLECTION_ID!;
    static readonly DATABASE_ID = 'watchlist';

    /**
     * Get all ratings/watchlist items for a user
     */
    static async getUserRatings(userId: string): Promise<RatingDocument[]> {
        try {
            const response = await database.listDocuments(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                [`user_id="${userId}"`]
            );
            return response.documents as RatingDocument[];
        } catch (error) {
            console.error('Error fetching user ratings:', error);
            throw error;
        }
    }

    /**
     * Add or update a rating/watchlist item
     */
    static async addOrUpdateRating(data: CreateRatingData): Promise<RatingDocument> {
        try {
            // Check if rating already exists
            const existing = await this.getUserRating(data.user_id, data.tmdb_id, data.tmdb_type);
            
            const ratingData = {
                user_id: data.user_id,
                user_name: data.user_name,
                tmdb_id: data.tmdb_id,
                tmdb_type: data.tmdb_type,
                media_title: data.media_title,
                rating: data.rating || 0,
                review: data.review || '',
                watch_status: data.watch_status || WatchStatus.WANT_TO_WATCH,
                date_watched: data.date_watched,
                rewatch_count: data.rewatch_count || 0,
                is_favorite: data.is_favorite || false,
                tags: data.tags || [],
                progress_data: data.progress_data,
                notes: data.notes || '',
                created_at: existing ? existing.created_at : new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (existing) {
                // Update existing rating
                const updated = await database.updateDocument(
                    this.DATABASE_ID,
                    this.COLLECTION_ID,
                    existing.$id,
                    ratingData
                );
                return updated as RatingDocument;
            } else {
                // Create new rating
                const created = await database.createDocument(
                    this.DATABASE_ID,
                    this.COLLECTION_ID,
                    ID.unique(),
                    ratingData,
                    [
                        Permission.read(Role.user(data.user_id)),
                        Permission.update(Role.user(data.user_id)),
                        Permission.delete(Role.user(data.user_id)),
                        Permission.read(Role.label('admin')),
                        Permission.update(Role.label('admin')),
                        Permission.delete(Role.label('admin'))
                    ]
                );
                return created as RatingDocument;
            }
        } catch (error) {
            console.error('Error adding/updating rating:', error);
            throw error;
        }
    }

    /**
     * Get a specific rating for a user and media item
     */
    static async getUserRating(userId: string, tmdbId: number, tmdbType: string): Promise<RatingDocument | null> {
        try {
            const response = await database.listDocuments(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                [
                    `user_id="${userId}"`,
                    `tmdb_id=${tmdbId}`,
                    `tmdb_type="${tmdbType}"`
                ]
            );
            return response.documents[0] as RatingDocument || null;
        } catch (error) {
            console.error('Error fetching user rating:', error);
            return null;
        }
    }

    /**
     * Update watch status
     */
    static async updateWatchStatus(
        userId: string, 
        tmdbId: number, 
        tmdbType: string, 
        watchStatus: WatchStatus,
        dateWatched?: string
    ): Promise<RatingDocument> {
        try {
            const existing = await this.getUserRating(userId, tmdbId, tmdbType);
            if (!existing) {
                throw new Error('Rating not found');
            }

            const updates: any = {
                watch_status: watchStatus,
                updated_at: new Date().toISOString()
            };

            if (watchStatus === WatchStatus.COMPLETED && dateWatched) {
                updates.date_watched = dateWatched;
            }

            const updated = await database.updateDocument(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                existing.$id,
                updates
            );

            return updated as RatingDocument;
        } catch (error) {
            console.error('Error updating watch status:', error);
            throw error;
        }
    }

    /**
     * Update rating and review
     */
    static async updateRatingAndReview(
        userId: string,
        tmdbId: number,
        tmdbType: string,
        rating: number,
        review?: string
    ): Promise<RatingDocument> {
        try {
            const existing = await this.getUserRating(userId, tmdbId, tmdbType);
            if (!existing) {
                throw new Error('Rating not found');
            }

            const updated = await database.updateDocument(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                existing.$id,
                {
                    rating,
                    review: review || '',
                    updated_at: new Date().toISOString()
                }
            );

            return updated as RatingDocument;
        } catch (error) {
            console.error('Error updating rating and review:', error);
            throw error;
        }
    }

    /**
     * Toggle favorite status
     */
    static async toggleFavorite(userId: string, tmdbId: number, tmdbType: string): Promise<RatingDocument> {
        try {
            const existing = await this.getUserRating(userId, tmdbId, tmdbType);
            if (!existing) {
                throw new Error('Rating not found');
            }

            const updated = await database.updateDocument(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                existing.$id,
                {
                    is_favorite: !existing.is_favorite,
                    updated_at: new Date().toISOString()
                }
            );

            return updated as RatingDocument;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    }

    /**
     * Remove from watchlist
     */
    static async removeRating(userId: string, tmdbId: number, tmdbType: string): Promise<void> {
        try {
            const existing = await this.getUserRating(userId, tmdbId, tmdbType);
            if (!existing) {
                throw new Error('Rating not found');
            }

            await database.deleteDocument(
                this.DATABASE_ID,
                this.COLLECTION_ID,
                existing.$id
            );
        } catch (error) {
            console.error('Error removing rating:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(userId: string): Promise<{
        total: number;
        byStatus: Record<WatchStatus, number>;
        averageRating: number;
        totalRated: number;
        favorites: number;
        totalReviews: number;
    }> {
        try {
            const ratings = await this.getUserRatings(userId);
            
            const byStatus = {
                [WatchStatus.WANT_TO_WATCH]: 0,
                [WatchStatus.WATCHING]: 0,
                [WatchStatus.COMPLETED]: 0,
                [WatchStatus.ON_HOLD]: 0,
                [WatchStatus.DROPPED]: 0
            };

            let totalRatingSum = 0;
            let ratedCount = 0;
            let favorites = 0;
            let totalReviews = 0;

            ratings.forEach(rating => {
                byStatus[rating.watch_status]++;
                
                if (rating.rating > 0) {
                    totalRatingSum += rating.rating;
                    ratedCount++;
                }
                
                if (rating.is_favorite) {
                    favorites++;
                }
                
                if (rating.review && rating.review.trim()) {
                    totalReviews++;
                }
            });

            return {
                total: ratings.length,
                byStatus,
                averageRating: ratedCount > 0 ? Math.round((totalRatingSum / ratedCount) * 10) / 10 : 0,
                totalRated: ratedCount,
                favorites,
                totalReviews
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    /**
     * Search user's ratings
     */
    static async searchUserRatings(userId: string, query: string): Promise<RatingDocument[]> {
        try {
            const allRatings = await this.getUserRatings(userId);
            const searchLower = query.toLowerCase();
            
            return allRatings.filter(rating => 
                rating.media_title.toLowerCase().includes(searchLower) ||
                (rating.review && rating.review.toLowerCase().includes(searchLower)) ||
                rating.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        } catch (error) {
            console.error('Error searching user ratings:', error);
            throw error;
        }
    }
}