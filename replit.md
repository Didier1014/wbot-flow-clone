# Zap Scale - WhatsApp Marketing Automation Dashboard

## Overview
Zap Scale is a WhatsApp marketing automation platform that enables businesses to manage contacts, create automated message flows, send mass broadcasts, and track campaign performance through an intuitive dashboard.

**Project Status**: Successfully imported and running on Replit
**Last Updated**: October 27, 2025

## Core Features
- **Dashboard Analytics**: View key metrics including total contacts, broadcasts, delivery rates, and conversions
- **WhatsApp Integration**: Connect WhatsApp accounts via QR code for automated messaging
- **Contact Management**: Organize and tag contacts, track message history
- **Automated Flows**: Create multi-step automated message sequences with triggers
- **Mass Broadcasts**: Send bulk messages with media attachments to targeted contact segments
- **Payment Verification**: Upload payment proofs for workspace activation
- **Admin Panel**: Review and approve payment submissions

## Tech Stack
### Frontend
- **React 18** with TypeScript
- **Vite** for development and bundling
- **Tailwind CSS** for styling (dark mode enabled)
- **shadcn/ui** component library
- **Recharts** for data visualization
- **React Query** (@tanstack/react-query) for data fetching
- **Wouter** for routing

### Backend
- **Express.js** server with TypeScript
- **PostgreSQL** database (Neon serverless)
- **Drizzle ORM** for database operations
- **JWT** authentication with bcrypt password hashing
- **BullMQ** + Redis for message queue processing
- **@whiskeysockets/baileys** for WhatsApp integration
- **Multer** for file uploads

## Project Structure
```
DashboardAI/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── auth.ts          # Authentication
│   ├── db.ts            # Database connection
│   ├── storage.ts       # Database operations
│   ├── whatsapp.ts      # WhatsApp integration
│   ├── queue.ts         # Message queue
│   └── vite.ts          # Vite dev server integration
├── shared/              # Shared code
│   └── schema.ts        # Database schema & types
├── migrations/          # Database migrations
└── uploads/             # User uploaded files

```

## Development Setup

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `PORT`: Server port (defaults to 5000)
- `JWT_SECRET`: Secret for JWT tokens (auto-generated)
- `REDIS_HOST`: Redis host for message queue (optional)
- `REDIS_PORT`: Redis port (optional)

### Running Locally
1. Install dependencies: `npm install`
2. Push database schema: `npm run db:push`
3. Start development server: `npm run dev`
   - Server runs on port 5000
   - Frontend served by Vite with HMR

### Database Schema
The application uses the following main tables:
- **users**: User accounts with authentication
- **workspaces**: User workspaces (linked to WhatsApp accounts)
- **contacts**: Contact list with tags and metadata
- **flows**: Automated message sequences
- **broadcasts**: Mass message campaigns
- **messages**: Individual messages sent/received
- **payments**: Payment proof submissions
- **whatsapp_sessions**: WhatsApp connection state

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token
- `GET /api/auth/me` - Get current user info

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/:id` - Get workspace details
- `PATCH /api/workspaces/:id` - Update workspace

### WhatsApp
- `POST /api/whatsapp/:workspaceId/connect` - Connect WhatsApp (get QR code)
- `GET /api/whatsapp/:workspaceId/status` - Check connection status
- `POST /api/whatsapp/:workspaceId/disconnect` - Disconnect WhatsApp

### Contacts
- `GET /api/workspaces/:workspaceId/contacts` - List contacts
- `POST /api/workspaces/:workspaceId/contacts` - Add contact
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Broadcasts
- `GET /api/workspaces/:workspaceId/broadcasts` - List broadcasts
- `POST /api/workspaces/:workspaceId/broadcasts` - Create broadcast
- `GET /api/broadcasts/:id/status` - Get broadcast status

### Flows
- `GET /api/workspaces/:workspaceId/flows` - List flows
- `POST /api/workspaces/:workspaceId/flows` - Create flow
- `GET /api/flows/:id` - Get flow details
- `PATCH /api/flows/:id` - Update flow
- `DELETE /api/flows/:id` - Delete flow

## Deployment
The application is configured for deployment on Replit with autoscale mode.

**Build Command**: `npm run build`
**Start Command**: `npm run start`

The production build:
1. Compiles the React frontend with Vite
2. Bundles the Express backend with esbuild
3. Serves static files and API from a single process on port 5000

## Known Limitations
- **Redis Optional**: Message queue features require Redis (not included in basic setup)
- **WhatsApp Connection**: WhatsApp Baileys library may require specific Node.js version
- **File Storage**: Uploads stored locally (consider object storage for production)

## Recent Changes
- Configured Vite for Replit's proxy system (HMR over WSS on port 443)
- Set up PostgreSQL database with Drizzle migrations
- Created .gitignore for Node.js project
- Configured deployment settings for Replit autoscale

## Future Enhancements
- Integrate Replit's object storage for file uploads
- Add Redis integration for message queue
- Implement real authentication (currently using mock data)
- Add rate limiting for API endpoints
- Set up automated backups for WhatsApp sessions
