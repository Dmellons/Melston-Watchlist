// app/api/ai/suggestions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Account } from "node-appwrite";
import { aiService } from "@/lib/services/aiService";
import { WatchlistDocument } from "@/types/appwrite";
import { AISuggestionRequest } from "@/types/ai";

export async function POST(req: NextRequest) {
  try {
    // Get JWT from cookies
    const jwt = (await cookies()).get(process.env.COOKIE_NAME!)?.value;

    if (!jwt) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // Create authenticated client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT_URL!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setJWT(jwt);

    client.setSession(jwt);

    const account = new Account(client);
    const databases = new Databases(client);

    // Verify user session
    let user;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json(
        { error: "Session expired - Please log in again" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AISuggestionRequest = await req.json();
    const { prompt, mediaType = 'all', limit = 5 } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Fetch user's watchlist items
    const watchlistResponse = await databases.listDocuments(
      'watchlist',
      process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
      []
    );

    const watchlistItems = watchlistResponse.documents as unknown as WatchlistDocument[];

    // Build preference context
    const context = aiService.buildPreferenceContext(
      user.$id,
      user.name || 'User',
      watchlistItems
    );

    // Get AI suggestions
    const suggestions = await aiService.getSuggestions(
      prompt.trim(),
      context,
      mediaType,
      limit
    );

    // Enrich suggestions with TMDB data
    const enrichedSuggestions = await aiService.enrichSuggestionsWithTMDB(
      suggestions.suggestions
    );

    return NextResponse.json({
      success: true,
      data: {
        ...suggestions,
        suggestions: enrichedSuggestions
      },
      context: {
        totalItems: watchlistItems.length,
        favoriteGenres: context.favoriteGenres.slice(0, 3).map(g => g.name),
        averageRating: context.averageRating
      }
    });

  } catch (error) {
    console.error("AI suggestions error:", error);

    // Check if it's an AI server connection error
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: "Unable to connect to AI server. Please check if the server is running." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get suggestions" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI Suggestions API - Use POST with { prompt, mediaType?, limit? }",
    endpoints: {
      POST: {
        description: "Get personalized AI suggestions",
        body: {
          prompt: "string (required) - What are you in the mood for?",
          mediaType: "movie | tv | game | all (optional, default: all)",
          limit: "number (optional, default: 5, max: 10)"
        }
      }
    }
  });
}
