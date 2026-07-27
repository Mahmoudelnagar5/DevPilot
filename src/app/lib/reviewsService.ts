/**
 * Reviews Service - Platform Reviews & Ratings
 * Allows clients to rate and review the platform
 */

import { supabase } from "./supabase";

export interface PlatformReview {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  rating: number; // 1-5 stars
  review_text: string;
  project_id?: string;
  project_name?: string;
  created_at: string;
  updated_at?: string;
  is_featured?: boolean; // For highlighting best reviews
}

/**
 * Submit a new platform review
 */
export async function submitReview(
  userId: string,
  userName: string,
  userRole: string,
  rating: number,
  reviewText: string,
  projectId?: string,
  projectName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Validate review text
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      return { success: false, error: "Review must be at least 10 characters" };
    }

    // Check if user already reviewed
    const { data: existingReview, error: checkError } = await supabase
      .from("platform_reviews")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing review:", checkError);
      return { success: false, error: "Failed to check existing review" };
    }

    if (existingReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from("platform_reviews")
        .update({
          rating,
          review_text: reviewText.trim(),
          project_id: projectId,
          project_name: projectName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id);

      if (updateError) {
        console.error("Error updating review:", updateError);
        return { success: false, error: "Failed to update review" };
      }

      return { success: true };
    } else {
      // Insert new review
      const { error: insertError } = await supabase
        .from("platform_reviews")
        .insert({
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          rating,
          review_text: reviewText.trim(),
          project_id: projectId,
          project_name: projectName,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting review:", insertError);
        return { success: false, error: "Failed to submit review" };
      }

      return { success: true };
    }
  } catch (error) {
    console.error("Error in submitReview:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all platform reviews
 */
export async function getAllReviews(limit = 50): Promise<PlatformReview[]> {
  try {
    const { data, error } = await supabase
      .from("platform_reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    return [];
  }
}

/**
 * Get user's review
 */
export async function getUserReview(userId: string): Promise<PlatformReview | null> {
  try {
    const { data, error } = await supabase
      .from("platform_reviews")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user review:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserReview:", error);
    return null;
  }
}

/**
 * Get featured reviews (high rated + marked as featured)
 */
export async function getFeaturedReviews(limit = 10): Promise<PlatformReview[]> {
  try {
    const { data, error } = await supabase
      .from("platform_reviews")
      .select("*")
      .or("is_featured.eq.true,rating.gte.4")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured reviews:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getFeaturedReviews:", error);
    return [];
  }
}

/**
 * Get platform average rating
 */
export async function getAverageRating(): Promise<{ average: number; count: number }> {
  try {
    const { data, error } = await supabase
      .from("platform_reviews")
      .select("rating");

    if (error) {
      console.error("Error fetching ratings:", error);
      return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / data.length;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: data.length,
    };
  } catch (error) {
    console.error("Error in getAverageRating:", error);
    return { average: 0, count: 0 };
  }
}

/**
 * Delete user's review
 */
export async function deleteReview(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("platform_reviews")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting review:", error);
      return { success: false, error: "Failed to delete review" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteReview:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
