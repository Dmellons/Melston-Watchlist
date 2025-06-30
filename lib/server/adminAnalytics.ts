// lib/server/adminAnalytics.ts - New file for admin analytics
"use server"
import { createAdminClient } from "@/lib/server/appwriteServer";
import { Query } from "node-appwrite";

export async function getAnalyticsData() {
  try {
    const { databases } = await createAdminClient();
    
    // Get all watchlist documents using admin permissions
    const allWatchlistItems = await databases.listDocuments(
      'watchlist',
      process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
      [
        Query.limit(1000), // Adjust as needed
        Query.orderDesc('$createdAt')
      ]
    );

    // Calculate analytics
    const analytics = {
      totalItems: allWatchlistItems.total,
      movies: allWatchlistItems.documents.filter(item => item.content_type === 'movie').length,
      tvShows: allWatchlistItems.documents.filter(item => item.content_type === 'tv').length,
      plexRequests: allWatchlistItems.documents.filter(item => item.plex_request).length,
      
      // Watch status breakdown
      watchStatusBreakdown: {
        want_to_watch: allWatchlistItems.documents.filter(item => item.watch_status === 'want_to_watch').length,
        watching: allWatchlistItems.documents.filter(item => item.watch_status === 'watching').length,
        completed: allWatchlistItems.documents.filter(item => item.watch_status === 'completed').length,
        on_hold: allWatchlistItems.documents.filter(item => item.watch_status === 'on_hold').length,
        dropped: allWatchlistItems.documents.filter(item => item.watch_status === 'dropped').length,
      },

      // Rating analytics
      ratingAnalytics: {
        totalRated: allWatchlistItems.documents.filter(item => item.user_rating && item.user_rating > 0).length,
        averageRating: calculateAverageRating(allWatchlistItems.documents),
        ratingDistribution: getRatingDistribution(allWatchlistItems.documents),
      },

      // Recent activity
      recentlyAdded: allWatchlistItems.documents.slice(0, 10),
      recentlyCompleted: allWatchlistItems.documents
        .filter(item => item.watch_status === 'completed' && item.date_watched)
        .sort((a, b) => new Date(b.date_watched!).getTime() - new Date(a.date_watched!).getTime())
        .slice(0, 10),

      // Top rated content
      topRated: allWatchlistItems.documents
        .filter(item => item.user_rating && item.user_rating > 0)
        .sort((a, b) => (b.user_rating || 0) - (a.user_rating || 0))
        .slice(0, 10),
    };

    return {
      success: true,
      data: analytics
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function calculateAverageRating(documents: any[]): number {
  const ratedItems = documents.filter(item => item.user_rating && item.user_rating > 0);
  if (ratedItems.length === 0) return 0;
  
  const sum = ratedItems.reduce((acc, item) => acc + item.user_rating, 0);
  return Math.round((sum / ratedItems.length) * 10) / 10; // Round to 1 decimal
}

function getRatingDistribution(documents: any[]): Record<string, number> {
  const distribution: Record<string, number> = {
    '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0
  };

  documents.forEach(item => {
    if (item.user_rating && item.user_rating > 0) {
      const rating = item.user_rating;
      if (rating <= 2) distribution['1-2']++;
      else if (rating <= 4) distribution['3-4']++;
      else if (rating <= 6) distribution['5-6']++;
      else if (rating <= 8) distribution['7-8']++;
      else distribution['9-10']++;
    }
  });

  return distribution;
}

// Get user-specific analytics (for admin to see individual user patterns)
export async function getUserAnalytics(userId: string) {
  try {
    const { databases } = await createAdminClient();
    
    // This would require adding a userId field to documents or using permission queries
    const userWatchlistItems = await databases.listDocuments(
      'watchlist',
      process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
      [
        Query.limit(1000),
        // You'd need to add userId as a field to query by user
        // Query.equal('userId', userId)
      ]
    );

    // Filter by permissions to get user-specific documents
    const userItems = userWatchlistItems.documents.filter(doc => 
      doc.$permissions.some(permission => permission.includes(`user:${userId}`))
    );

    return {
      success: true,
      data: {
        totalItems: userItems.length,
        movies: userItems.filter(item => item.content_type === 'movie').length,
        tvShows: userItems.filter(item => item.content_type === 'tv').length,
        completed: userItems.filter(item => item.watch_status === 'completed').length,
        averageRating: calculateAverageRating(userItems),
        favoriteGenres: calculateFavoriteGenres(userItems),
      }
    };

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function calculateFavoriteGenres(documents: any[]): Array<{genre: string, count: number}> {
  const genreCount: Record<string, number> = {};
  
  documents.forEach(item => {
    if (item.genre_ids && Array.isArray(item.genre_ids)) {
      item.genre_ids.forEach((genreId: number) => {
        // You'd need a mapping of genre IDs to names
        // For now, just use the ID
        const genreKey = genreId.toString();
        genreCount[genreKey] = (genreCount[genreKey] || 0) + 1;
      });
    }
  });

  return Object.entries(genreCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}