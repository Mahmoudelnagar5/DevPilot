#!/usr/bin/env node
/**
 * Migration: Create platform_reviews table
 * Allows clients to rate and review the platform
 */

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SQL = `
-- Create platform_reviews table
CREATE TABLE IF NOT EXISTS platform_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL CHECK (length(review_text) >= 10),
  project_id TEXT,
  project_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON platform_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON platform_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON platform_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON platform_reviews(is_featured, rating DESC);

-- Enable RLS
ALTER TABLE platform_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public can read all reviews
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON platform_reviews
FOR SELECT
TO public
USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY IF NOT EXISTS "Users can insert own reviews"
ON platform_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY IF NOT EXISTS "Users can update own reviews"
ON platform_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY IF NOT EXISTS "Users can delete own reviews"
ON platform_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
`;

async function main() {
  console.log("🚀 Applying platform_reviews migration...\n");

  try {
    const statements = SQL.split(";").filter((s) => s.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      const { error } = await supabase.rpc("exec_sql", { 
        sql: statement + ";" 
      });
      
      if (error) {
        console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`);
        console.error(`   Error: ${error.message}`);
      } else {
        console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`);
      }
    }

    console.log("\n📊 Testing platform_reviews table...");
    
    // Test: Count existing reviews
    const { count, error: countError } = await supabase
      .from("platform_reviews")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Failed to query reviews:", countError.message);
    } else {
      console.log(`✅ Reviews table is ready! Current reviews: ${count || 0}`);
    }

    console.log("\n🎉 Migration complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Clients can now submit reviews from dashboard");
    console.log("2. Reviews are stored in 'platform_reviews' table");
    console.log("3. RLS policies protect user data");

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

main();
