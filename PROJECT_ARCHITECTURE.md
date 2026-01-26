# PandaDuck Pix - Project Architecture & Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Application Architecture](#application-architecture)
6. [Data Flow](#data-flow)
7. [API Layer](#api-layer)
8. [Component Hierarchy](#component-hierarchy)
9. [Routing](#routing)
10. [State Management](#state-management)
11. [Development Guide](#development-guide)

---

## Project Overview

**PandaDuck Pix** is a gamepad repair service website targeting professional gamers. It provides specialized repair and customization services for PlayStation DualSense controllers, including hall-effect sensor upgrades, clicky button modules, back button mods, and battery upgrades.

### Key Features

- **Multi-step repair request flow**: Controller selection → Service selection → Shipping form
- **Dynamic pricing**: Controller-specific service and option pricing
- **Discount system**: Service combos with percentage/fixed discounts
- **Admin panel**: Full CRUD for services, controllers, repairs, and reviews
- **PWA support**: Progressive Web App with offline capabilities
- **Mobile ready**: Capacitor integration for native iOS/Android apps

---

## Tech Stack

### Frontend Framework

- **React 18.3.1** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite 6.3.5** - Build tool and dev server

### Styling

- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **@tailwindcss/vite** - Vite plugin for Tailwind CSS 4

### UI Components

- **Radix UI** - Headless, accessible component primitives
  - @radix-ui/react-accordion
  - @radix-ui/react-alert-dialog
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - ... (30+ Radix components)
- **shadcn/ui** - Styled Radix components
- **Lucide React 0.487.0** - Icon library

### Backend & Database

- **Supabase 2.91.0** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Storage for images

### Routing

- **React Router DOM 7.12.0** - Client-side routing

### Mobile & PWA

- **Capacitor 6.2.0** - Native iOS/Android wrapper
- **vite-plugin-pwa 0.21.2** - PWA with Workbox

### Form Handling

- **react-hook-form 7.55.0** - Form validation

### Additional Libraries

- **sonner 2.0.3** - Toast notifications
- **date-fns 3.6.0** - Date formatting
- **recharts 2.15.2** - Charts (admin dashboard)
- **embla-carousel-react 8.6.0** - Carousel component

---

## Project Structure

```
PandaDuckPix/
├── public/                          # Static assets
│   ├── icons/                      # PWA and app icons
│   ├── images/                     # Static images
│   └── manifest.json               # PWA manifest
│
├── src/
│   ├── main.tsx                    # Entry point
│   │
│   ├── app/                        # Main application
│   │   ├── App.tsx                # Root component with routes
│   │   └── components/
│   │       ├── HomeScreen.tsx       # Landing page
│   │       ├── ControllerSelection.tsx  # Step 1: Select controller
│   │       ├── ServiceSelection.tsx      # Step 2: Select services
│   │       ├── RepairForm.tsx       # Step 3: Shipping form
│   │       ├── ServicesPage.tsx     # Services list page
│   │       ├── ReviewsPage.tsx      # Customer reviews
│   │       ├── AboutPage.tsx       # About page
│   │       ├── MenuDrawer.tsx       # Mobile navigation drawer
│   │       ├── Footer.tsx           # Footer component
│   │       └── ServiceDetailModal.tsx # Service details popup
│   │       └── ui/                # shadcn/ui components (40+ files)
│   │
│   ├── admin/                      # Admin panel
│   │   ├── AdminApp.tsx            # Admin root
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Admin authentication
│   │   ├── components/
│   │   │   ├── AdminLayout.tsx     # Admin sidebar layout
│   │   │   ├── LoginPage.tsx       # Admin login
│   │   │   ├── AddServiceModal.tsx
│   │   │   ├── EditServiceModal.tsx
│   │   │   └── ServiceOptionsModal.tsx
│   │   └── pages/
│   │       ├── Dashboard.tsx        # Admin dashboard
│   │       ├── ServicesPage.tsx     # Manage services
│   │       ├── ControllersPage.tsx  # Manage controllers
│   │       ├── RepairsPage.tsx     # Manage repair requests
│   │       └── ReviewsPage.tsx     # Manage reviews
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useServices.ts          # Fetch services
│   │   ├── useServicesWithPricing.ts  # Fetch services with pricing
│   │   ├── useServiceCombos.ts     # Fetch discount combos
│   │   ├── useRepairRequest.ts     # Fetch single repair request
│   │   └── useReviews.ts          # Fetch reviews
│   │
│   ├── lib/                        # Core libraries
│   │   ├── supabase.ts            # Supabase client setup
│   │   ├── api.ts                 # API functions
│   │   └── reviewUtils.ts         # Review utilities
│   │
│   ├── services/                   # Business logic
│   │   └── pricingService.ts      # Pricing calculations
│   │
│   ├── types/                      # TypeScript types
│   │   └── database.ts            # Database type definitions
│   │
│   ├── utils/                      # Utility functions
│   │   └── controllerModels.ts     # Controller model mapping
│   │
│   ├── styles/                     # Global styles
│   │   └── index.css              # Tailwind imports
│   │
│   └── pages/                     # Standalone pages
│       └── ReviewPage.tsx          # Public review submission page
│
├── supabase/                       # Database migrations
│   └── migrations/                 # SQL migration files
│       └── [001-030].sql
│
├── capacitor.config.ts              # Capacitor configuration
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind configuration
├── package.json                    # Dependencies
├── index.html                     # HTML entry
└── vercel.json                   # Vercel deployment config
```

---

## Database Schema

### ER Diagram Overview

```
┌─────────────────┐
│ controller_models│
│ (id, model_id,  │
│  model_name)     │
└────────┬────────┘
         │ 1
         │
         │ *
┌─────────────────────────┐
│ controller_services     │
│ (id, controller_model_id│
│  service_id, name,     │
│  base_price)           │
└───────────┬───────────┘
            │ 1
            │
            │ *
┌──────────────────────────────┐
│ controller_service_options  │
│ (id, controller_service_id,│
│  option_name,             │
│  additional_price)         │
└──────────────────────────────┘
            │ 1
            │
            │ *
┌──────────────────────────┐
│ repair_request_services │
│ (id, repair_request_id,│
│  service_id,           │
│  selected_option_id)   │
└───────────┬──────────┘
            │ *
            │ 1
┌─────────────────┐
│ repair_requests│
│ (id, customer_name,│
│  status, total_amount)│
└─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ services       │    │ service_options │
│ (id, service_id,│    │ (id, service_id,│
│  name, price)   │    │  option_name)   │
└─────────────────┘    └─────────────────┘
         │ 1                   │ 1
         │ *                   │ *
┌──────────────────────────────┐
│ controller_service_options  │
│ controller_service_pricing  │
│ controller_option_pricing   │
└──────────────────────────────┘
```

### Core Tables

#### 1. **controller_models**

Defines available controller models (DualSense, DualSense Edge, etc.)

| Column        | Type    | Description                           |
| ------------- | ------- | ------------------------------------- |
| id            | UUID    | Primary key                           |
| model_id      | TEXT    | Unique identifier (e.g., 'dualsense') |
| model_name    | TEXT    | Display name (e.g., 'DualSense')      |
| description   | TEXT    | Description                           |
| is_active     | BOOLEAN | Active status                         |
| display_order | INTEGER | Sort order                            |

#### 2. **controller_services** (PRIMARY)

Services available for each controller model

| Column              | Type    | Description                              |
| ------------------- | ------- | ---------------------------------------- |
| id                  | UUID    | Primary key                              |
| controller_model_id | UUID    | FK → controller_models.id                |
| service_id          | TEXT    | Service identifier (e.g., 'hall-effect') |
| name                | TEXT    | Service name                             |
| description         | TEXT    | Service description                      |
| base_price          | NUMERIC | Base price                               |
| is_active           | BOOLEAN | Active status                            |
| display_order       | INTEGER | Sort order                               |
| duration            | TEXT    | Service duration (e.g., '1일')           |
| warranty            | TEXT    | Warranty period                          |
| features            | JSONB   | Service features array                   |
| process_steps       | JSONB   | Process steps array                      |
| image_url           | TEXT    | Service image                            |

#### 3. **controller_service_options**

Options available for each controller service

| Column                | Type    | Description                 |
| --------------------- | ------- | --------------------------- |
| id                    | UUID    | Primary key                 |
| controller_service_id | UUID    | FK → controller_services.id |
| option_name           | TEXT    | Option name                 |
| option_description    | TEXT    | Option description          |
| additional_price      | NUMERIC | Additional cost             |
| is_active             | BOOLEAN | Active status               |
| display_order         | INTEGER | Sort order                  |

#### 4. **repair_requests**

Customer repair request records

| Column                    | Type      | Description                                                             |
| ------------------------- | --------- | ----------------------------------------------------------------------- |
| id                        | UUID      | Primary key                                                             |
| customer_name             | TEXT      | Customer name                                                           |
| customer_phone            | TEXT      | Customer phone                                                          |
| customer_email            | TEXT      | Customer email                                                          |
| controller_model          | TEXT      | Selected controller model                                               |
| issue_description         | TEXT      | Customer issue description                                              |
| status                    | TEXT      | Status: 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled' |
| total_amount              | INTEGER   | Total amount                                                            |
| estimated_completion_date | DATE      | Estimated completion                                                    |
| actual_completion_date    | DATE      | Actual completion                                                       |
| review_token              | TEXT      | Token for review submission                                             |
| review_sent_at            | TIMESTAMP | Review email sent time                                                  |

#### 5. **repair_request_services**

Services selected in each repair request

| Column             | Type    | Description                                                    |
| ------------------ | ------- | -------------------------------------------------------------- |
| id                 | UUID    | Primary key                                                    |
| repair_request_id  | UUID    | FK → repair_requests.id                                        |
| service_id         | UUID    | FK → services.id (**ISSUE: Should be controller_services.id**) |
| selected_option_id | UUID    | FK → service_options.id                                        |
| service_price      | INTEGER | Service price at booking                                       |
| option_price       | INTEGER | Option price at booking                                        |

#### 6. **service_combos**

Discount combinations

| Column               | Type    | Description                |
| -------------------- | ------- | -------------------------- |
| id                   | UUID    | Primary key                |
| combo_name           | TEXT    | Combo name                 |
| description          | TEXT    | Description                |
| discount_type        | TEXT    | 'percentage' or 'fixed'    |
| discount_value       | NUMERIC | Discount amount/percentage |
| required_service_ids | TEXT[]  | Required service IDs       |
| is_active            | BOOLEAN | Active status              |

#### 7. **reviews**

Customer reviews

| Column            | Type    | Description             |
| ----------------- | ------- | ----------------------- |
| id                | UUID    | Primary key             |
| repair_request_id | UUID    | FK → repair_requests.id |
| customer_name     | TEXT    | Customer name           |
| rating            | INTEGER | Rating (1-5)            |
| content           | TEXT    | Review content          |
| service_name      | TEXT    | Service name            |
| image_url         | TEXT    | Review image URL        |
| is_approved       | BOOLEAN | Admin approved          |
| is_public         | BOOLEAN | Publicly visible        |

#### 8. **admin_users**

Admin authentication

| Column        | Type    | Description   |
| ------------- | ------- | ------------- |
| id            | UUID    | Primary key   |
| email         | TEXT    | Admin email   |
| password_hash | TEXT    | Password hash |
| is_active     | BOOLEAN | Active status |

#### 9. **status_history**

Status change history for repairs

| Column            | Type | Description             |
| ----------------- | ---- | ----------------------- |
| id                | UUID | Primary key             |
| repair_request_id | UUID | FK → repair_requests.id |
| previous_status   | TEXT | Previous status         |
| new_status        | TEXT | New status              |
| changed_by        | TEXT | Who changed it          |
| notes             | TEXT | Change notes            |

### Schema Issues

**CRITICAL ISSUE**: The `repair_request_services.service_id` foreign key currently references `services.id` instead of `controller_services.id`. This causes foreign key violations because:

- The application fetches services from `controller_services` table
- But the database FK points to the old `services` table
- UUIDs don't match between the two tables

**Solution**: Update the foreign key to reference `controller_services.id`.

---

## Application Architecture

### Architecture Pattern

- **Client-Side Rendering (CSR)** with React
- **Component-based architecture** with functional components and hooks
- **Repository pattern** for data access (API layer)
- **Custom hooks** for reusable logic
- **Context API** for authentication state

### Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│  (React Components, UI, Routing, Form Handling)     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   Business Logic Layer                │
│     (Custom Hooks, Pricing Logic, Validation)       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                     Data Access Layer                │
│            (API Functions, Supabase Client)        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                 Database/Backend Layer               │
│         (Supabase PostgreSQL + Storage)             │
└───────────────────────────────────────────────────────┘
```

---

## Data Flow

### User Repair Request Flow

```
1. Home Screen (/)
   ├─ User selects "수리 시작하기"
   └─ Navigate to /controllers

2. Controller Selection (/controllers)
   ├─ Fetch: controller_models (active, sorted)
   ├─ User selects controller model (UUID)
   ├─ Navigate to /services with state: { controllerModel }
   └─ State: selectedModelId

3. Service Selection (/services)
   ├─ Fetch: controller_services (by controllerModelId)
   ├─ Fetch: controller_service_options (for each service)
   ├─ Fetch: service_combos
   ├─ User selects services and options
   ├─ Calculate pricing:
   │   ├─ Subtotal = sum(service.base_price + option.additional_price)
   │   ├─ Apply best discount combo
   │   └─ Total = Subtotal - Discount
   ├─ Navigate to /repair/form with state: { controllerModel, selectionData }
   └─ State: selectedServices, selectedOptions, pricing

4. Repair Form (/repair/form)
   ├─ Display: Service summary + pricing
   ├─ User enters: name, phone, address
   ├─ Submit:
   │   ├─ API: createRepairRequest()
   │   │   ├─ Insert into repair_requests
   │   │   └─ Insert into repair_request_services
   │   ├─ Show success modal
   │   └─ Navigate to /
   └─ State: formData, submitted, success
```

### Admin Data Management Flow

```
1. Authentication
   ├─ User enters email/password
   ├─ API: Query admin_users table
   ├─ Set AuthContext: isAuthenticated = true
   └─ Navigate to /admin/dashboard

2. Dashboard
   ├─ Fetch: repair_requests (all, with status)
   ├─ Fetch: reviews (approved, public)
   ├─ Display: Stats cards (total, pending, completed)
   └─ Display: Recent repairs table

3. Services Management
   ├─ Fetch: controller_services (with options)
   ├─ CRUD operations:
   │   ├─ Create: Insert controller_services + options
   │   ├─ Read: Fetch by controller_model_id
   │   ├─ Update: Update controller_services + options
   │   └─ Delete: Deactivate (is_active = false)
   └─ Modal: Add/Edit service

4. Repair Request Management
   ├─ Fetch: repair_requests (with services)
   ├─ Update status:
   │   ├─ Select new status
   │   ├─ Insert into status_history
   │   └─ Update repair_requests.status
   └─ View details modal

5. Review Management
   ├─ Fetch: reviews (all)
   ├─ Approve/Reject:
   │   ├─ Update reviews.is_approved
   │   └─ Update reviews.is_public
   └─ Delete: Remove from reviews table
```

---

## API Layer

### Supabase Client Setup

**File**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### API Functions

**File**: `src/lib/api.ts`

#### Services API

##### `fetchControllerServices(controllerModelId: string)`

Fetches services for a specific controller model

**Query**:

```sql
SELECT * FROM controller_services
WHERE controller_model_id = $1 AND is_active = true
ORDER BY display_order ASC
```

**Returns**: `ControllerServiceWithOptions[]`

##### `fetchControllerModels()`

Fetches all active controller models

**Query**:

```sql
SELECT * FROM controller_models
WHERE is_active = true
ORDER BY display_order ASC
```

**Returns**: `ControllerModel[]`

#### Repair Requests API

##### `createRepairRequest(params: CreateRepairRequestParams)`

Creates a new repair request with services

**Parameters**:

```typescript
{
  customerName: string
  customerPhone: string
  customerEmail?: string
  controllerModel: string
  issueDescription?: string
  services: Array<{
    serviceId: string      // UUID from controller_services
    optionId?: string
    servicePrice: number
    optionPrice?: number
  }>
  totalAmount: number
}
```

**Transaction**:

1. Insert into `repair_requests`
2. Insert services into `repair_request_services`
3. Rollback if services insertion fails

**Returns**: `RepairRequest`

##### `fetchRepairRequestByToken(token: string)`

Fetches repair request by review token

**Query**:

```sql
SELECT * FROM repair_requests
WHERE review_token = $1
```

**Returns**: `RepairRequest | null`

#### Reviews API

##### `submitReview(params: SubmitReviewParams)`

Submits a new review

**Parameters**:

```typescript
{
  repairRequestId?: string
  customerName: string
  rating: number
  content: string
  serviceName: string
  imageUrl?: string
}
```

**Insert**: Into `reviews` table

**Returns**: `Review`

##### `fetchPublicReviews(limit?: number)`

Fetches approved public reviews

**Query**:

```sql
SELECT * FROM reviews
WHERE is_approved = true AND is_public = true
ORDER BY created_at DESC
LIMIT $1
```

**Returns**: `Review[]`

##### `fetchAverageRating()`

Calculates average rating from approved reviews

**Query**:

```sql
SELECT rating FROM reviews
WHERE is_approved = true AND is_public = true
```

**Returns**: `number` (rounded to 1 decimal)

#### Service Combos API

##### `fetchServiceCombos()`

Fetches active discount combos

**Query**:

```sql
SELECT * FROM service_combos
WHERE is_active = true
ORDER BY discount_value DESC
```

**Returns**: `ServiceCombo[]`

---

## Component Hierarchy

### Main Application Components

```
App (Root Router)
├─ HomeScreen (/)
│  ├─ MenuDrawer
│  ├─ ServiceDetailModal
│  └─ Footer
│
├─ ControllerSelection (/controllers)
│  └─ Footer
│
├─ ServiceSelection (/services)
│  └─ Footer
│
├─ RepairForm (/repair/form)
│  └─ Footer
│
├─ ServicesPage (/services/list)
│  └─ Footer
│
├─ ReviewsPage (/reviews)
│  └─ Footer
│
└─ AboutPage (/about)
   └─ Footer

ReviewPage (/review/:token) [Standalone]
```

### Admin Panel Components

```
AdminApp (Root Admin Router)
├─ AuthProvider
│  ├─ LoginPage (if not authenticated)
│  └─ AdminLayout (if authenticated)
│     ├─ Sidebar Navigation
│     └─ Main Content
│        ├─ Dashboard (/admin)
│        │  └─ Stats Cards + Recent Repairs Table
│        ├─ ServicesPage (/admin/services)
│        │  ├─ Services Table
│        │  ├─ AddServiceModal
│        │  ├─ EditServiceModal
│        │  └─ ServiceOptionsModal
│        ├─ ControllersPage (/admin/controllers)
│        │  └─ Controllers Table
│        ├─ RepairsPage (/admin/repairs)
│        │  ├─ Repair Requests Table
│        │  ├─ Status Filter
│        │  └─ Details Modal
│        └─ ReviewsPage (/admin/reviews)
│           └─ Reviews Table (approve/reject)
```

### UI Components (shadcn/ui)

Reusable UI primitives used across the application:

**40+ components including**:

- Button, Input, Textarea, Select
- Dialog, Alert Dialog, Sheet, Drawer
- Card, Badge, Separator
- Tabs, Accordion, Collapsible
- Tooltip, Popover, Dropdown Menu
- Table, Pagination
- Form, Checkbox, Switch, Radio Group
- Avatar, Skeleton
- Calendar, Date Picker
- Scroll Area, Resizable Panels
- ...and more

---

## Routing

### Main Routes (React Router v7)

**File**: `src/main.tsx`

| Path             | Component           | Description                 |
| ---------------- | ------------------- | --------------------------- |
| `/`              | HomeScreen          | Landing page                |
| `/controllers`   | ControllerSelection | Select controller model     |
| `/services`      | ServiceSelection    | Select services and options |
| `/repair/form`   | RepairForm          | Enter shipping info         |
| `/services/list` | ServicesPage        | Browse all services         |
| `/reviews`       | ReviewsPage         | View customer reviews       |
| `/about`         | AboutPage           | About company               |

### Admin Routes

| Path                 | Component       | Description            |
| -------------------- | --------------- | ---------------------- |
| `/admin/*`           | AdminApp        | Admin panel root       |
| `/admin/`            | Dashboard       | Admin dashboard        |
| `/admin/services`    | ServicesPage    | Manage services        |
| `/admin/controllers` | ControllersPage | Manage controllers     |
| `/admin/repairs`     | RepairsPage     | Manage repair requests |
| `/admin/reviews`     | ReviewsPage     | Manage reviews         |

### Standalone Routes

| Path             | Component  | Description              |
| ---------------- | ---------- | ------------------------ |
| `/review/:token` | ReviewPage | Public review submission |

---

## State Management

### Strategy

**Local State with React Hooks** - No global state library (Redux, Zustand, etc.)

### State by Scope

#### 1. **Local Component State** (useState)

Used for UI state and form inputs

```typescript
// Form inputs
const [formData, setFormData] = useState({
  name: '',
  phone: '',
  address: '',
})

// UI toggles
const [isMenuOpen, setIsMenuOpen] = useState(false)
const [showModal, setShowModal] = useState(false)

// Selections
const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
```

#### 2. **Routing State** (useLocation)

Used to pass data between pages

```typescript
const location = useLocation()
const controllerModel = location.state?.controllerModel
const selectionData = location.state?.selectionData
```

#### 3. **Context API** (Global Auth)

Used for admin authentication

```typescript
// AuthContext.tsx
const AuthContext = createContext({
  isAuthenticated: boolean
  user: { id: string; email: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
})

// Usage in components
const { isAuthenticated, login, logout } = useAuth()
```

### Custom Hooks

#### `useServicesWithPricing(controllerModelId: string | null)`

Fetches services with options for a controller model

**Returns**:

```typescript
{
  services: ControllerServiceWithPricing[]
  loading: boolean
  error: Error | null
  controllerModelUuid: string | null
}
```

**Data flow**:

```typescript
useEffect(() →
  fetchControllerServices(controllerModelId)
  → fetchOptionsForEachService()
  → setServices(data)
)
```

#### `useServiceCombos()`

Fetches active discount combos

**Returns**:

```typescript
{
  combos: ServiceCombo[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}
```

#### `useRepairRequest(requestId: string | null)`

Fetches a single repair request by ID

#### `useReviews()`

Fetches public reviews

**Returns**:

```typescript
{
  reviews: Review[]
  loading: boolean
  error: Error | null
}
```

### Data Fetching Patterns

#### 1. **On Component Mount** (useEffect)

```typescript
useEffect(() => {
  const loadData = async () => {
    const data = await fetchControllerServices(modelId)
    setServices(data)
  }
  loadData()
}, [modelId])
```

#### 2. **With Cleanup**

```typescript
useEffect(() => {
  let isMounted = true

  const loadData = async () => {
    const data = await fetchServices()
    if (isMounted) {
      setServices(data)
    }
  }

  loadData()

  return () => {
    isMounted = false
  }
}, [])
```

#### 3. **State Reset on Unmount** (ServiceSelection.tsx)

```typescript
useEffect(() => {
  return () => {
    // Reset state to prevent caching issues
    setServices([])
    setSelectedServices(new Set())
    setSelectedOptions({})
  }
}, [controllerModelId])
```

---

## Development Guide

### Environment Setup

1. **Clone repository**

```bash
git clone <repository-url>
cd PandaDuckPix
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**
   Create `.env` file in project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Start development server**

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

### Build Commands

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Start development server |
| `npm run build`    | Production build         |
| `npm run preview`  | Preview production build |
| `npm run lint`     | Run ESLint               |
| `npm run lint:fix` | Fix ESLint issues        |
| `npm run format`   | Format with Prettier     |

### Code Style

- **ESLint**: Linting rules for TypeScript and React
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling
- **Strict TypeScript**: All type checking enabled

### Adding New Features

#### 1. **New Page**

1. Create component in `src/app/components/`
2. Add route in `src/main.tsx`
3. Add navigation link in `MenuDrawer.tsx`

#### 2. **New API Function**

1. Add function in `src/lib/api.ts`
2. Define types in `src/types/database.ts`
3. Create custom hook in `src/hooks/`

#### 3. **New Database Table**

1. Create migration in `supabase/migrations/`
2. Update types in `src/types/database.ts`
3. Run migration: `supabase db push`

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Check migration status
supabase db remote changes
```

### Testing Admin Panel

1. Navigate to `/admin`
2. Login with admin credentials
3. Test CRUD operations
4. Verify data persistence

### Common Issues & Solutions

#### Issue: "Missing Supabase environment variables"

**Solution**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### Issue: "Foreign key constraint violation"

**Solution**: The `repair_request_services.service_id` FK should reference `controller_services.id`, not `services.id`

#### Issue: "Services not loading"

**Solution**: Check Supabase RLS policies ensure public read access for `controller_services` table

---

## Known Issues & Technical Debt

### 1. **Schema Mismatch**

- **Issue**: `repair_request_services.service_id` references wrong table
- **Impact**: Foreign key violations when creating repair requests
- **Solution**: Update FK to reference `controller_services.id`

### 2. **Unused Tables**

- **services** table is legacy (replaced by `controller_services`)
- **service_options** table is legacy (replaced by `controller_service_options`)
- **controller_service_pricing** and **controller_option_pricing** exist but unused

### 3. **State Caching**

- Navigation state may become stale between page navigations
- **Mitigation**: Added useEffect cleanup in ServiceSelection component

### 4. **Admin Authentication**

- Passwords stored in plain text (not hashed)
- **Recommendation**: Implement bcrypt password hashing

---

## Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Configure environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Build command**: `npm run build`
4. **Output directory**: `dist`
5. **Deploy**

### PWA Deployment

The application is configured as a PWA:

- Service Worker auto-registers
- Offline caching enabled
- Installable on mobile devices

### Mobile App Deployment

#### iOS

```bash
npm run cap:init
npm run cap:add:ios
npm run build:mobile
npm run cap:open:ios
# Build in Xcode and upload to App Store
```

#### Android

```bash
npm run cap:init
npm run cap:add:android
npm run build:mobile
npm run cap:open:android
# Build in Android Studio and upload to Play Store
```

---

## API Reference Summary

### Tables Accessed

| Table                      | Purpose                 | Access Type                        |
| -------------------------- | ----------------------- | ---------------------------------- |
| controller_models          | Controller models       | Read (public)                      |
| controller_services        | Services per controller | Read (public)                      |
| controller_service_options | Service options         | Read (public)                      |
| repair_requests            | Customer requests       | Read/Write (public/admin)          |
| repair_request_services    | Request services        | Write (public), Read (admin)       |
| service_combos             | Discount combos         | Read (public)                      |
| reviews                    | Customer reviews        | Write (public), Read/Write (admin) |
| admin_users                | Admin accounts          | Read/Write (admin)                 |
| status_history             | Repair status history   | Read/Write (admin)                 |

### CRUD Operations by Role

| Role            | Read                                                                                                 | Write                                                                                                 | Delete                          |
| --------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------- |
| **Public User** | controller_models, controller_services, controller_service_options, service_combos, reviews (public) | repair_requests, repair_request_services, reviews                                                     | -                               |
| **Admin**       | All tables                                                                                           | controller_services, controller_service_options, repair_requests (status), reviews, controller_models | Soft delete (is_active = false) |

---

## Future Enhancements

1. **Fix Schema Issues** - Update foreign key references
2. **Authentication** - Implement proper password hashing
3. **Email Notifications** - Send review request emails
4. **Payment Integration** - Add payment gateway (Toss, Kakao Pay)
5. **Real-time Updates** - Supabase Realtime for repair status
6. **Image Uploads** - Customer uploads photos of damaged controllers
7. **Admin Analytics** - More detailed reporting dashboard

---

## Documentation Version

- **Generated**: 2025-01-26
- **Project Version**: 1.0.0
- **Last Updated**: ULTRAWORK MODE
