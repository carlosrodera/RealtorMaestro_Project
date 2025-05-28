# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RealtorMaestro (Realtor 360) is a **standalone MVP** real estate application with AI-powered image transformation and property description generation. **No database required** - everything runs with LocalStorage.

**Live Demo**: https://silly-pothos-e6feaa.netlify.app  
**Credentials**: `demo` / `demo123`

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
- Frontend: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, Wouter
- UI Components: Radix UI, Lucide Icons, RemixIcon
- Storage: LocalStorage (no database)
- Auth: Simple demo auth (demo/demo123)
- External: n8n webhooks for AI processing
- Image Editor: Fabric.js

### LocalStorage Structure
```javascript
realtor360_user            // Current user session
realtor360_projects        // User projects (max 10)
realtor360_transformations // Image transformations (max 5 recent)
realtor360_descriptions    // Property descriptions (max 5 recent)
realtor360_credits         // User credits
realtor360_webhook_responses // Temporary webhook responses
```

## Key Features & Implementation

### 1. Authentication (No Backend)
- Demo credentials: `demo` / `demo123`
- Session stored in LocalStorage
- No real user management needed

### 2. Image Transformation Flow
```javascript
1. User uploads image → Converted to JPEG if needed
2. Editor with Fabric.js (drawing tools, shapes, text)
3. Send as FormData to n8n: https://agenteia.top/webhook-test/transform-image
4. n8n processes and callbacks to: /webhook-receiver.html
5. App polls LocalStorage for response
6. Display with before/after slider
```

### 3. Credits System (Demo Only)
- Free: 5 credits
- Professional: 100 credits (€29 demo)
- Enterprise: Unlimited (€99 demo)
- No real payments - instant "upgrade" for demo

### 4. n8n Integration
- Webhook expects binary JPEG (not base64)
- Callback to: `https://[your-domain]/webhook-receiver.html`
- Google Drive storage for transformed images
- See `CONFIGURACION_N8N.md` and `N8N_WEBHOOK_UPDATE.md`

## Recent Updates (January 2025)

### Fixed Issues:
- ✅ All 404 navigation errors resolved
- ✅ LocalStorage quota exceeded error fixed
- ✅ Webhook callback handling improved
- ✅ UI/UX completely revamped
- ✅ Added "100% Personalizado" style option

### New Features:
- Professional landing page with testimonials
- Improved dashboard with quick actions
- Visual loading states for transformations
- Better error handling and user feedback
- Responsive design improvements

## Deployment

### Netlify (Current)
- Auto-deploys from GitHub main branch
- Configuration in `netlify.toml`
- Static webhook receiver at `/webhook-receiver.html`

### Local Development
- No environment variables needed
- No database setup required
- Works immediately after `npm install`

## Important Notes

1. **Demo Mode Only** - Not production-ready
2. **Storage Limits** - Automatic cleanup of old items
3. **n8n Required** - Must configure external webhook
4. **Credits Demo** - No real payment processing
5. **Public URLs** - All deployed to Netlify

## Common Tasks

### Add a new transformation style
Edit `/client/src/components/transformation/StyleSelector.tsx`

### Change credit limits
Edit `/client/src/lib/localStorage.ts` → `creditsStorage`

### Modify webhook URL
Edit `/client/src/hooks/use-transformations.ts` → Line 84

### Update n8n callback URL
Change HTTP Request node to use `/webhook-receiver.html`

## File Structure
```
/client/src/
  /components/
    /transformation/   # Image editor components
    /description/      # Description generator
    /ui/               # Radix UI components
    /layout/           # Navbar, Sidebar, MainLayout
    /project/          # Project management
  /hooks/              # React hooks (localStorage-based)
  /lib/
    localStorage.ts    # All data persistence
    webhookReceiver.ts # n8n callback handler + polling
  /pages/              # Route components
  /contexts/           # Auth context
```

## Known Limitations

1. **Binary Image Upload** - n8n expects FormData, not JSON
2. **Webhook Callback** - Must use static HTML, not React routes
3. **LocalStorage Polling** - 2-second interval for webhook responses
4. **No Real Backend** - All data in browser storage

## Testing Webhooks Locally

Since n8n can't reach localhost, use:
1. **ngrok**: `ngrok http 3000`
2. **localtunnel**: `lt --port 3000`
3. **Cloudflare Tunnel**: For permanent URLs

Then update callback URL in the webhook payload.

## Support Files

- `VERIFICACION_FLUJO_N8N.md` - Complete flow verification
- `N8N_WEBHOOK_UPDATE.md` - Webhook configuration update
- `CONFIGURACION_N8N.md` - Original n8n setup