# Barton ATIS Cloud - Design Guidelines

## Design Approach

**System Selected:** shadcn/ui Design Language  
**Justification:** Aviation operations tool requiring clear information hierarchy, data density, and professional aesthetic. shadcn/ui provides accessible components with excellent readability and structured layouts ideal for critical aviation data display.

**Key Principles:**
- Clarity over decoration: Information must be immediately scannable
- Hierarchy through typography and spacing, not color
- Professional, trustworthy aesthetic for aviation operations
- Responsive design for tower operators (desktop) and pilots (mobile)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component internal spacing: p-4, p-6
- Section spacing: py-8, py-12, py-16
- Grid gaps: gap-4, gap-6, gap-8

**Container Strategy:**
- Dashboard: max-w-7xl with px-4 md:px-6 lg:px-8
- Content sections: Full-width with inner max-w-6xl
- Data cards: w-full within grid layouts

**Grid Patterns:**
- Desktop: 3-column grid for status cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Main dashboard: 2-column split (current ATIS 2/3 width, weather/charts 1/3 width)
- Historical data: Full-width tables with side filters

---

## Typography

**Font Stack:** Inter (via Google Fonts CDN)
```
font-sans (default): Inter for all UI text
```

**Hierarchy:**
- Page titles: text-3xl font-bold tracking-tight
- Section headers: text-2xl font-semibold
- Card titles: text-lg font-semibold
- Data labels: text-sm font-medium uppercase tracking-wide
- Data values: text-2xl md:text-3xl font-bold (for QNH, runway, etc.)
- Body text: text-base
- Helper text: text-sm text-muted-foreground
- Timestamps: text-xs font-mono

---

## Component Library

### Core Layout Components

**Header:**
- Fixed top navigation with site title "Barton ATIS Cloud"
- Quick action buttons: Book Out, Inbound PPR, Account Portal
- Live status indicator badge showing "Airfield Open/Closed"
- Last update timestamp with auto-refresh indicator

**Dashboard Cards:**
Use shadcn Card component pattern (border, rounded-lg, shadow-sm):
- Current ATIS Information Card: Large primary card showing Info letter, runway in use, circuit direction, QNH/QFE
- Airfield Status Card: Status, closing time, touch-and-go permissions
- Weather Observation Card: METAR display with formatted breakdown
- Runway Status Grid: 4 cards showing each runway condition
- Operational Briefing: Scrollable area with NOTAM items as list
- Met Warnings: Alert-style card with warning badge

### Data Display Patterns

**Status Indicators:**
- Badge components for status (Open, Closed, Caution)
- Small circular indicators for real-time data freshness
- Icon + label pattern for runway/weather status

**Metric Display:**
```
[LABEL]
[LARGE VALUE] [UNIT]
```
Example: 
QNH  
**0993** hPa

**Tables:**
- shadcn Table component for historical statistics
- Sortable columns with icons
- Alternating row styling for readability
- Fixed header on scroll

### Interactive Elements

**Charts (Historical Statistics):**
- Recharts library for wind/weather trend visualization
- Line charts for pressure, temperature over time
- Wind rose diagram for wind direction distribution
- Bar charts for runway usage statistics

**Document Downloads:**
- Button group with dropdown for NOTAM types selection
- Checkbox list for aerodrome information sections
- Primary "Download PDF" button with download icon

**Date Range Selector:**
- Calendar picker (shadcn Calendar component)
- Quick select options (Last 24hrs, 7 days, 30 days)

---

## Navigation Structure

**Main Dashboard View (Default):**
- Hero section with large current ATIS display (no background image, pure data focus)
- Grid layout: Status cards + Weather + Runway conditions
- Operational briefing prominent below

**Historical Statistics View:**
- Side navigation or tabs switching between data types
- Filter panel (date range, data types)
- Full-width chart area
- Data export button top-right

**Documents View:**
- Download center with organized sections
- NOTAM categories with expand/collapse
- Aerodrome info sections with checkboxes
- Batch download functionality

---

## Accessibility Implementation

**ARIA Labels:**
- All status indicators: `aria-label="Airfield status: Open"`
- Data values: `aria-label="QNH 0993 hectopascals"`
- Timestamps: `aria-live="polite"` for auto-updates

**Keyboard Navigation:**
- Skip to main content link
- Tab order: Header actions → Main ATIS → Supporting data → Footer
- Focus visible states on all interactive elements
- Arrow keys for table/chart navigation

**Semantic HTML:**
- Proper heading hierarchy (h1 → h2 → h3)
- `<time>` elements for all timestamps
- `<table>` for tabular historical data
- `<section>` for logical content areas

---

## Visual Enhancements

**Icons:** Lucide React (lucide-react package)
- Wind: Wind icon
- Runway: Plane icon
- Weather: Cloud, CloudRain, Sun icons
- Download: Download icon
- Refresh: RefreshCw icon
- Status: CheckCircle, AlertCircle, XCircle

**Subtle Animations:**
- Auto-refresh pulse on update indicator (animate-pulse)
- Card hover elevation (transition-shadow)
- Loading skeleton for data fetch
- NO scroll animations or excessive motion

**Border Usage:**
- Card borders: border border-border
- Section dividers: border-t
- Table cells: border-b
- Input focus: focus:ring-2 focus:ring-ring

---

## Responsive Behavior

**Mobile (< 768px):**
- Stack all cards vertically
- Simplified header with hamburger menu for actions
- Touch-friendly button sizing (min-h-12)
- Horizontal scroll for data tables

**Tablet (768px - 1024px):**
- 2-column grid for status cards
- Side-by-side weather and runway status

**Desktop (> 1024px):**
- Full 3-column layout
- Fixed sidebar for historical data filters
- Multi-column runway status grid

---

## Unique Design Decisions

**Aviation-Specific Patterns:**
- Monospace font for METAR and NOTAM codes
- ALL CAPS for runway designators (08L/26R)
- UTC time display prominently
- Pressure values in bold, larger than labels
- Wind direction as degrees with cardinal direction
- Runway surface state with emoji/icon indicators

**Real-Time Data Display:**
- Timestamp with seconds for currency
- Visual pulse/indicator when data refreshes
- "Stale data" warning if update fails
- Connection status indicator in header

This design creates a professional, highly functional ATIS system that prioritizes information clarity and rapid scanning while maintaining modern aesthetics and full accessibility for aviation operations.