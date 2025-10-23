# Barton ATIS Cloud

A modern, accessible ATIS (Aeronautical Terminal Information Service) web application for Barton Aerodrome (EGCB). Built with React, TypeScript, and shadcn/ui to provide pilots and aerodrome operators with real-time aviation information in a beautiful, user-friendly interface.

## Features

### Core Functionality
- **Live ATIS Dashboard**: Real-time display of current aerodrome information including:
  - Information code (alphabet letter identifier)
  - Runway in use and circuit direction
  - QNH and QFE pressure settings
  - Touch and go permissions
  - Airfield status and closing times
  
- **Weather Observation**: Comprehensive weather display with:
  - Full METAR string in monospace font
  - Wind direction and speed (with gusts)
  - Temperature and dewpoint
  - Visibility and cloud coverage
  - Meteorological warnings with visual alerts
  
- **Runway Status**: Real-time grid showing all four runways:
  - 08L/26R, 08R/26L, 02/20, 13/31
  - Current surface conditions
  - Operational status
  
- **NOTAMs & Operational Briefing**: 
  - Active NOTAMs sorted by severity
  - Color-coded priority (high, medium, low)
  - Valid from/to timestamps
  - Category badges (Fuel, Aerodrome, Taxiway, etc.)
  
- **Historical Statistics**: Interactive data visualization with:
  - Pressure trends (QNH/QFE over time)
  - Wind speed and direction charts
  - Temperature trends
  - Quick filters (24hrs, 7 days, 30 days)
  - Custom date range selection
  
- **Document Downloads**:
  - Generate PDF downloads for NOTAMs
  - Generate aerodrome information packets
  - Selectable categories and sections
  - Timestamped downloads

### User Experience
- **Auto-refresh**: Dashboard updates every 60 seconds
- **Dark Mode**: Full theme support with persistent preferences
- **Responsive Design**: Optimized for both desktop and mobile
  - Desktop: Left sidebar navigation
  - Mobile: Bottom tab navigation
- **Accessible**: ARIA labels, semantic HTML, keyboard navigation
- **Professional Design**: Aviation-focused aesthetic with proper typography hierarchy

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **wouter** for client-side routing
- **TanStack Query** for data fetching and caching
- **date-fns** for date handling

### Backend
- **Express.js** REST API
- **In-memory storage** for development
- **PDF generation** for document downloads

## Project Structure

```
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── atis/              # ATIS-specific components
│   │   │   │   ├── current-atis-card.tsx
│   │   │   │   ├── weather-card.tsx
│   │   │   │   ├── runway-status-grid.tsx
│   │   │   │   ├── notam-list.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── metric-display.tsx
│   │   │   │   └── status-badge.tsx
│   │   │   ├── charts/            # Data visualization
│   │   │   │   ├── pressure-chart.tsx
│   │   │   │   ├── wind-chart.tsx
│   │   │   │   └── temperature-chart.tsx
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── pages/
│   │   │   ├── dashboard.tsx      # Main ATIS view
│   │   │   ├── historical.tsx     # Historical statistics
│   │   │   └── documents.tsx      # Document downloads
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── API/
│   ├── routes.ts                  # API endpoints
│   └── storage.ts                 # Data storage layer
├── shared/
│   └── schema.ts                  # Shared TypeScript types
└── design_guidelines.md           # Design system documentation
```

## API Endpoints

### GET /api/atis/current
Returns current ATIS data including weather, runways, and NOTAMs.

**Response:**
```json
{
  "atis": {
    "informationCode": "U",
    "airfieldStatus": "Airfield Open",
    "runwayInUse": "26L",
    "circuitDirection": "RH",
    "qnh": 993,
    "qfe": 991,
    "touchAndGo": "Permitted",
    "closingTime": "1655z"
  },
  "weather": {
    "metar": "EGCB 231605Z 33009KT 9999 SCT024 FEW040 11/05 Q0993",
    "windDirection": 330,
    "windSpeed": 9,
    "temperature": 11,
    "dewpoint": 5,
    "visibility": "9999m",
    "cloudCoverage": "SCT024 FEW040",
    "warnings": "W TO NW WINDS..."
  },
  "runways": [...],
  "notams": [...],
  "lastUpdated": "2025-10-23T18:07:39.000Z"
}
```

### GET /api/atis/historical
Returns historical data points for charts.

**Query Parameters:**
- `from`: ISO date string (start date)
- `to`: ISO date string (end date)

**Response:**
```json
[
  {
    "timestamp": "2025-10-23T12:00:00.000Z",
    "qnh": 993,
    "qfe": 991,
    "temperature": 11,
    "windSpeed": 9,
    "windDirection": 330
  }
]
```

### POST /api/documents/notams
Generates PDF document with selected NOTAM categories.

**Request Body:**
```json
{
  "categories": ["aerodrome", "operational", "navigation"]
}
```

### POST /api/documents/aerodrome
Generates PDF document with selected aerodrome information.

**Request Body:**
```json
{
  "sections": ["general", "runways", "frequencies", "procedures"]
}
```

## Development

The application is already configured and running. Key commands:

- `npm run dev` - Starts both frontend and backend servers
- Frontend runs on Vite dev server
- Backend runs on Express (port 5000)

## Design System

The application follows a professional aviation design system:

- **Colors**: Professional blue primary color with semantic status colors
  - Green: Open/Normal
  - Amber: Caution/Warnings
  - Red: Closed/Critical
  
- **Typography**: 
  - Sans-serif (Inter) for UI
  - Monospace (JetBrains Mono) for METAR and technical data
  
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable shadcn/ui components with aviation-specific styling

## Future Enhancements

- Multi-aerodrome support with dynamic configuration
- Real aviation weather API integration (NOAA, Aviation Weather Center)
- User accounts and favorite aerodrome management
- Push notifications for critical weather changes
- Printable flight briefing pack generator
- WebSocket for real-time updates
- Historical data export (CSV/Excel)

## Aviation Conventions

The application follows standard aviation practices:
- All times displayed in UTC (Coordinated Universal Time) with 'z' suffix
- Runway designators in uppercase format (08L/26R)
- METAR format weather observations
- Standard NOTAM categorization
- QNH (altimeter setting) and QFE (airfield pressure) in hectopascals

## Notes

This is a demonstration application with seeded data. For production use:
1. Replace in-memory storage with persistent database
2. Integrate with official aviation weather APIs
3. Implement authentication and authorization
4. Add comprehensive error logging and monitoring
5. Set up automated NOTAM updates from official sources
