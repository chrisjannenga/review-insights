const { config } = require("dotenv");
const { sql } = require("@vercel/postgres");
const { drizzle } = require("drizzle-orm/vercel-postgres");

// Load environment variables from .env file
if (process.env.NODE_ENV === 'production') {
  config({ path: '.env.production' });
} else {
  config();
}

async function main() {
  try {
    console.log("Starting database setup...");
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS "users" (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP WITH TIME ZONE,
        password TEXT NOT NULL,
        image TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Create accounts table
    await sql`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, "providerAccountId")
      );
    `;

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sessionToken" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `;

    // Create verification tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS "verificationToken" (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `;

    // Create business locations table
    await sql`
      CREATE TABLE IF NOT EXISTS "businessLocations" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
        "claimedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Create claimed businesses table
    await sql`
      CREATE TABLE IF NOT EXISTS "claimed_businesses" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id),
        "placeId" TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS "reviews" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "placeId" TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "authorAvatar" TEXT,
        rating INTEGER NOT NULL,
        sentiment TEXT NOT NULL,
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Update claimed_businesses table to use userId instead of user_id if it exists
    await sql`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'claimed_businesses' 
          AND column_name = 'user_id'
        ) THEN
          ALTER TABLE claimed_businesses
          RENAME COLUMN user_id TO "userId";
        END IF;
      END $$;
    `;

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

main(); 