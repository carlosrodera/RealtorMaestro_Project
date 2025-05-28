# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RealtorMaestro (Realtor 360) is a **standalone MVP** real estate application with AI-powered image transformation and property description generation. **No database required** - everything runs with LocalStorage.

## Development Commands

```bash
# Start development server (client only, no backend needed)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Clean install
npm run clean && npm install
```

## Architecture

**Simplified MVP Architecture (No Database)**:

- `/client` - React frontend with all functionality
- `/shared` - Shared types (minimal use in MVP)
- **No active backend** - Everything runs client-side with LocalStorage

### Key Technologies
- Frontend: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS
- Storage: LocalStorage (no database)
- Auth: Simple demo auth (demo/demo123)
- External: n8n webhooks for AI processing

### LocalStorage Structure
```javascript
realtor360_user        // Current user session
realtor360_projects    // User projects (max 10)
realtor360_transformations // Image transformations (max 10)
realtor360_descriptions    // Property descriptions (max 10)
realtor360_credits      // User credits
```

## Key Features & Implementation

### 1. Authentication (No Backend)
- Demo credentials: `demo` / `demo123`
- Session stored in LocalStorage
- No real user management needed

### 2. Image Transformation Flow
```javascript
1. User uploads image (base64)
2. Editor with Fabric.js (drawing tools, shapes, text)
3. Send to n8n webhook: https://agenteia.top/webhook-test/transform-image
4. Webhook returns transformed image URL
5. Display with before/after slider
```

### 3. Credits System (Demo Only)
- Free: 5 credits
- Basic: 20 credits ($19 demo)
- Pro: 100 credits ($49 demo)
- No real payments - instant "upgrade" for demo

### 4. n8n Integration
- Webhook endpoint expects JPEG images
- Callback via `/webhook-callback` route
- Google Drive storage for transformed images
- See `CONFIGURACION_N8N.md` for setup

## Deployment

### Netlify (Recommended)
```bash
npm run build
# Drag 'dist' folder to Netlify
```

Configuration already included in `netlify.toml`

### Local Development
- No environment variables needed
- No database setup required
- Works immediately after `npm install`

## Important Notes

1. **Demo Mode Only** - Not production-ready
2. **Storage Limits** - Max 10 items per category in LocalStorage
3. **No Real AI** - n8n webhook must be configured separately
4. **Credits Demo** - No real payment processing
5. **Public Webhooks** - Callback URLs are exposed

## Common Tasks

### Add a new transformation style
Edit `/client/src/components/transformation/StyleSelector.tsx`

### Change credit limits
Edit `/client/src/lib/localStorage.ts` → `creditsStorage`

### Modify webhook URL
Edit `/client/src/hooks/use-transformations.ts` → Line 71

### Add demo data
Edit `/client/src/lib/demoData.ts`

## File Structure
```
/client/src/
  /components/
    /transformation/  # Image editor components
    /description/     # Description generator
    /ui/             # Radix UI components
  /hooks/            # React hooks (localStorage-based)
  /lib/
    localStorage.ts  # All data persistence
    webhookReceiver.ts # n8n callback handler
  /pages/            # Route components
```

## Testing Webhooks Locally

Since n8n can't reach localhost, use:
1. **ngrok**: `ngrok http 3000`
2. **localtunnel**: `lt --port 3000`
3. **Cloudflare Tunnel**: For permanent URLs

Then update callback URL in the webhook payload.