# Message-to-Join MVP

A minimal inbound-only WhatsApp message collection system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Public Join Page** (`/join`): Shows WhatsApp link + QR code for users to send a keyword
- **Admin Dashboard** (`/admin`): Password-protected CSV import/export and contact management
- **Inbound-only**: No outbound messaging, just collect and manage inbound WhatsApp messages
- **Simple CSV workflow**: Import WhatsApp export CSVs, view contacts, export filtered results

## Quick Start

```bash
pnpm i && pnpm dev
```

Then open [http://localhost:3000/join](http://localhost:3000/join) to see the public join page.

## Setup

### 1. Create Supabase Database Table

In your Supabase SQL Editor, run:

```sql
create extension if not exists pgcrypto;
create table if not exists inbound (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null,
  keyword text,
  raw_text text,
  country_iso2 text,
  source text not null default 'whatsapp',
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_inbound_phone on inbound(phone_e164);
create index if not exists idx_inbound_created_at on inbound(created_at desc);
```

### 2. Configure Environment Variables

Update `.env.local` with your settings:

```env
NEXT_PUBLIC_WA_NUMBER_E164="+1234567890"     # Your WhatsApp number in E.164 format
NEXT_PUBLIC_WA_KEYWORD="JOIN"                # Keyword users should send
SUPABASE_URL="https://xxx.supabase.co"       # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY="..."              # Your Supabase service role key
ADMIN_PASSWORD="your-secure-password"        # Password for admin access
DEFAULT_COUNTRY="US"                         # Default country for phone parsing
```

### 3. Change WhatsApp Number/Keyword

1. Update `NEXT_PUBLIC_WA_NUMBER_E164` in `.env.local` with your WhatsApp Business number
2. Update `NEXT_PUBLIC_WA_KEYWORD` with your desired keyword (e.g., "SUBSCRIBE", "JOIN", "UPDATES")
3. Restart the development server

## Usage

### Importing CSV

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Login with your `ADMIN_PASSWORD`
3. Upload a CSV file with headers: `phone`, `message`, `keyword`, `received_at`
4. The system will:
   - Normalize phone numbers to E.164 format
   - Deduplicate entries (same phone + keyword within 24 hours)
   - Show import summary (imported/skipped/invalid counts)

Sample CSV format:
```csv
phone,message,keyword,received_at
+1234567890,"JOIN updates please",JOIN,2024-01-15T10:30:00Z
(555) 123-4567,"I want to join",JOIN,2024-01-15T11:00:00Z
```

### Exporting Results

1. In the admin dashboard, use the filters to narrow down contacts:
   - Phone contains: partial phone number search
   - Date range: filter by creation date
2. Click "Export CSV" to download filtered results
3. The export includes: phone_e164, keyword, raw_text, country_iso2, received_at, created_at

## File Structure

```
├── app/
│   ├── layout.tsx          # Root layout with minimal Tailwind
│   ├── join/page.tsx       # Public page with WhatsApp link + QR code
│   └── admin/page.tsx      # Admin dashboard with all functionality
├── lib/
│   ├── supabase.ts         # Server-only Supabase client
│   └── phone.ts            # Phone number normalization utility
├── public/
│   └── sample.csv          # Sample CSV file for testing
└── .env.local              # Environment configuration
```

## How It Works

1. **Public Page**: Users visit `/join` and see a WhatsApp link with your number and keyword pre-filled, plus a QR code
2. **Message Collection**: Users send WhatsApp messages (manually - this is inbound-only)
3. **CSV Import**: Export chat history from WhatsApp Business, then import the CSV via admin dashboard
4. **Management**: View, filter, and export your contact list through the admin interface

## Security Notes

- Admin authentication uses simple password + HttpOnly cookie (24-hour expiry)
- Server actions handle all data processing (no client-side API routes)
- Supabase service role key is server-side only
- No RLS policies needed for this MVP (single admin use case)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Phone parsing**: libphonenumber-js
- **CSV processing**: PapaParse
- **QR codes**: qrcode package