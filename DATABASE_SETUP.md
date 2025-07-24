# Database Setup Options for COER Connect

## Option 1: MongoDB Atlas (Recommended - Free)
- Website: https://www.mongodb.com/atlas
- Free Tier: 512MB storage, 100 connections
- Setup: Create account → Create cluster → Get connection string
- Compatibility: ✅ Works with existing Mongoose code

## Option 2: Supabase (PostgreSQL - Free)
- Website: https://supabase.com
- Free Tier: 500MB database, 50MB file storage
- Setup: Create account → New project → Get database URL
- Requires: Minor code changes from MongoDB to PostgreSQL

## Option 3: PlanetScale (MySQL - Free)
- Website: https://planetscale.com
- Free Tier: 1GB storage, 1 billion row reads/month
- Setup: Create account → New database → Get connection string
- Requires: Code changes from MongoDB to MySQL

## Option 4: Railway (Multiple databases - Free)
- Website: https://railway.app
- Free Tier: $5 credit monthly (usually enough for small projects)
- Supports: PostgreSQL, MySQL, MongoDB, Redis
- Setup: Very simple deployment

## Quick Setup Instructions:

### For MongoDB Atlas:
1. Sign up at https://www.mongodb.com/atlas
2. Create a new cluster (choose free tier)
3. Create database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string
6. Replace in your .env.local file

### For Supabase (if you prefer PostgreSQL):
1. Sign up at https://supabase.com  
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. I'll help convert your Mongoose models to work with PostgreSQL
