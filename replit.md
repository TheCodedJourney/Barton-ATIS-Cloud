# Barton ATIS Cloud

## Overview

Barton ATIS Cloud is a real-time aviation operations application that provides live Aerodrome Terminal Information Service (ATIS) data for Barton Aerodrome (EGCB). The application displays current weather conditions, runway status, QNH/QFE pressure settings, NOTAMs (Notices to Airmen), and historical weather statistics. It serves both tower operators (desktop) and pilots (mobile) with a professional, accessible interface optimized for aviation operations.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed to display critical aviation information with clarity and immediate scannability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and bundler.

**UI Component System**: shadcn/ui design system with Radix UI primitives. This choice prioritizes:
- Accessibility-first components for safety-critical aviation context
- Clear information hierarchy through typography and spacing
- Professional aesthetic suitable for operational environments
- Responsive design supporting both desktop (tower operators) and mobile (pilots)

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables. The theme system supports light/dark modes with carefully calibrated colors for readability. Design guidelines emphasize clarity over decoration, using spacing primitives (2, 4, 6, 8, 12, 16, 20) for consistent layout.

**Typography**: Inter font family for all UI text with a hierarchical scale from page titles (text-3xl) down to timestamps (text-xs font-mono), ensuring scannable data presentation.

**State Management**: TanStack Query (React Query) for server state management with auto-refresh capabilities (60-second intervals for current ATIS data). No global client state management library is used; component-level state is managed with React hooks.

**Routing**: Wouter for lightweight client-side routing with three main routes:
- Dashboard (`/`) - Current ATIS information and live data
- Historical (`/historical`) - Time-series charts and data analysis
- Documents (`/documents`) - NOTAM downloads and aerodrome information

**Data Visualization**: Recharts library for historical weather trend charts (pressure, wind, temperature).

### Backend Architecture

**Framework**: Express.js server with TypeScript, using ESM module format.

**API Design**: RESTful JSON API with three primary endpoints:
- `GET /api/atis/current` - Returns current ATIS snapshot
- `GET /api/atis/historical?from=<date>&to=<date>` - Returns time-series data
- `POST /api/documents/notams` - Filters and returns NOTAM documents

**Development Mode**: Vite middleware integration for hot module replacement during development. Production mode serves pre-built static assets from `dist/public`.

**Data Storage Strategy**: Currently uses in-memory storage (`MemStorage` class) with seeded mock data. The storage interface (`IStorage`) is designed to be swapped for a database implementation without changing the API layer. Database schema is defined using Drizzle ORM with PostgreSQL dialect.

**Type Safety**: Shared TypeScript types between client and server via `shared/schema.ts`, ensuring type consistency across the full stack. Drizzle-zod integration generates runtime validators from database schemas.

### Database Layer (Prepared but Not Active)

**ORM**: Drizzle ORM configured for PostgreSQL with schema definition in `shared/schema.ts`.

**Schema Design**: Five main tables modeling aviation data:
- `atis_info` - Current ATIS broadcast information (code, QNH/QFE, runway, circuit direction)
- `weather_obs` - Weather observations including METAR strings and parsed values
- `runway_status` - Individual runway condition and surface state
- `notams` - Notices to Airmen with categorization and severity
- `historical_stats` (referenced in types) - Aggregated statistics

**Migration Strategy**: Drizzle Kit configured with migrations directory, supporting schema evolution with `npm run db:push`.

**Connection**: Configured to use Neon serverless Postgres driver via `DATABASE_URL` environment variable. The application will use Postgres when the environment variable is provided, otherwise falls back to in-memory storage.

### Deployment Architecture

**Build Process**: Two-stage build:
1. Frontend: Vite bundles React application to `dist/public`
2. Backend: esbuild bundles server code to `dist/index.js` with external packages

**Production Server**: Node.js serves both API endpoints and static frontend files from a single Express instance.

**Environment Configuration**: Requires `DATABASE_URL` for production database connection. Development mode runs without database using mock data.

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Unstyled, accessible component primitives (accordion, dialog, dropdown, popover, select, etc.)
- **shadcn/ui**: Pre-styled components built on Radix UI following New York design variant
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Chart library for data visualization
- **Embla Carousel**: Touch-enabled carousel component

### Core Framework Dependencies
- **React & React DOM**: v18+ for UI rendering
- **Wouter**: Lightweight routing (replaces React Router)
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with Zod validation
- **date-fns**: Date manipulation and formatting

### Backend Dependencies
- **Express**: Web server framework
- **Drizzle ORM**: Type-safe database ORM
- **@neondatabase/serverless**: Serverless Postgres driver
- **Zod**: Runtime type validation
- **connect-pg-simple**: PostgreSQL session store (prepared for future auth)

### Build & Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type system across full stack
- **Tailwind CSS**: Utility-first CSS framework
- **esbuild**: Backend bundler for production
- **tsx**: TypeScript execution for development
- **Drizzle Kit**: Database migration tool

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation in Replit
- **@replit/vite-plugin-dev-banner**: Development mode indicator

### Fonts
- **Google Fonts**: Inter (UI text) and JetBrains Mono (monospace for METAR/data)