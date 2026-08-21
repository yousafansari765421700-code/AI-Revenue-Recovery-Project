# Supabase Database Schema

This directory contains the database schema for AI Revenue Recovery.

## Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Update `.env.local` with your Supabase project URL and anon key
3. Run the migration SQL in the Supabase SQL Editor:

```bash
# Or via Supabase CLI
supabase db reset
```

## Migration Files

- `20240101000000_initial_schema.sql` — Complete database schema with tables, RLS policies, indexes, and triggers

## Schema Overview

### Tables

1. **profiles** — User profiles with business info
2. **customers** — Customer records linked to users
3. **invoices** — Invoice tracking with payment status
4. **failed_payments** — Failed payment detection and recovery tracking
5. **recovery_campaigns** — Recovery campaign management
6. **recovery_actions** — Individual recovery action records
7. **revenue_metrics** — Daily revenue analytics

### Security

All user-owned tables have Row Level Security (RLS) enabled with policies ensuring users can only access their own records.

## Generated Types

TypeScript types are available in `types/database.ts`.
