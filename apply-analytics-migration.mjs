#!/usr/bin/env node
/**
 * Migration: Create platform_analytics table
 * This table stores real-time platform statistics
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
-- Create platform_analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitors_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial record
INSERT INTO platform_analytics (visitors_count, last_updated)
VALUES (30, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_platform_analytics_updated 
ON platform_analytics(last_updated DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so anyone can see stats on auth page)
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON platform_analytics
FOR SELECT
TO public
USING (true);

-- Only authenticated users can update (for incrementing visitors)
CREATE POLICY IF NOT EXISTS "Allow authenticated update"
ON platform_analytics
FOR UPDATE
TO authenticated
USING (true);
`;

async function main() {
  console.log("🚀 Applying platform_analytics migration...\n");

  try {
    const { data, error } = await supabase.rpc("exec_sql", { sql: SQL });

    if (error) {
      console.error("❌ Migration failed:", error.message);
      
      // Try alternative approach: execute statements one by one
      console.log("\n📝 Trying alternative approach...");
      const statements = SQL.split(";").filter((s) => s.trim());
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        const { error: stmtError } = await supabase.rpc("exec_sql", { 
          sql: statement + ";" 
        });
        
        if (stmtError) {
          console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`);
          console.error(`   Error: ${stmtError.message}`);
        } else {
          console.log(`✅ Statement executed: ${statement.substring(0, 50)}...`);
        }
      }
    } else {
      console.log("✅ Migration applied successfully!");
    }

    console.log("\n📊 Testing platform_analytics table...");
    
    // Test: Insert initial data if not exists
    const { data: existingData, error: selectError } = await supabase
      .from("platform_analytics")
      .select("*")
      .single();

    if (selectError && selectError.code === "PGRST116") {
      // No rows found, insert initial data
      console.log("📝 Inserting initial analytics data...");
      const { error: insertError } = await supabase
        .from("platform_analytics")
        .insert({
          visitors_count: 30,
          last_updated: new Date().toISOString(),
        });

      if (insertError) {
        console.error("❌ Failed to insert initial data:", insertError.message);
      } else {
        console.log("✅ Initial data inserted successfully!");
      }
    } else if (existingData) {
      console.log("✅ Analytics table already has data:");
      console.log(`   Visitors: ${existingData.visitors_count}`);
      console.log(`   Last Updated: ${existingData.last_updated}`);
    }

    console.log("\n🎉 Migration complete!");
    console.log("\n📝 Next steps:");
    console.log("1. The platform_analytics table is ready");
    console.log("2. Visitor count will auto-increment on page visits");
    console.log("3. Stats are fetched from real database");

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

main();
