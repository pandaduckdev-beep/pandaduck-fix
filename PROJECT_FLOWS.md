# PandaDuck Pix - Flow Diagrams

## User Journey Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        HOME SCREEN (/)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Landing Page:                                             │  │
│  │  - Hero section with CTA "수리 시작하기"                    │  │
│  │  - Feature cards (4 services)                                │  │
│  │  - Service detail modals                                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              │ [Click]
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│              CONTROLLER SELECTION (/controllers)                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Progress: ●──○──○                                       │  │
│  │                                                             │  │
│  │  Fetch: controller_models                                   │  │
│  │                                                             │  │
│  │  Display: Controller cards (DualSense, DualSense Edge, etc.)   │  │
│  │                                                             │  │
│  │  User Action: Select model → Click "계속하기"              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              │ Navigate + State
                              │ { controllerModel: UUID }
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│               SERVICE SELECTION (/services)                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Progress: ●──●──○                                       │  │
│  │                                                             │  │
│  │  Fetch:                                                    │  │
│  │  1. controller_services (by controllerModelId)               │  │
│  │  2. controller_service_options (for each service)            │  │
│  │  3. service_combos (discount rules)                         │  │
│  │                                                             │  │
│  │  Display: Service cards with options                          │  │
│  │  - Base price + option prices                                │  │
│  │  - Combo discounts applied                                   │  │
│  │                                                             │  │
│  │  User Action: Select services → Click "계속하기"            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              │ Navigate + State
                              │ { controllerModel, selectionData }
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  REPAIR FORM (/repair/form)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Progress: ●──●──●                                       │  │
│  │                                                             │  │
│  │  Display:                                                  │  │
│  │  - Service summary (list of selected services)                │  │
│  │  - Pricing breakdown (subtotal, discount, total)             │  │
│  │  - Form fields: name, phone, address                       │  │
│  │  - Company shipping address                                   │  │
│  │                                                             │  │
│  │  User Action: Fill form → Click "수리 신청하기"            │  │
│  │                                                             │  │
│  │  Show confirmation modal                                      │  │
│  │                                                             │  │
│  │  Submit: API call → createRepairRequest()                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              │ Success
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    SUCCESS MODAL                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ✓ Request submitted successfully!                            │  │
│  │                                                             │  │
│  │  Display:                                                  │  │
│  │  - Customer name, phone                                     │  │
│  │  - Total amount                                             │  │
│  │  - Shipping address (company)                                │  │
│  │                                                             │  │
│  │  Action: Click "확인" → Navigate to Home                   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Database Write Operations Flow

### Create Repair Request

```
User: Submit Form
    │
    ▼
Component: RepairForm.handleSubmit()
    │
    ├─ Validate form data
    ├─ Show confirmation modal
    └─ User confirms
        │
        ▼
API: createRepairRequest(params)
    │
    ├─ Step 1: Insert repair_request
    │   │
    │   ▼
    │   ┌──────────────────────────────────────────────┐
    │   │ INSERT INTO repair_requests                  │
    │   │ (customer_name, customer_phone,           │
    │   │  controller_model, total_amount, ...)       │
    │   │ VALUES (...)                              │
    │   │                                         │
    │   │ RETURN: repair_request.id (UUID)          │
    │   └──────────────────────────────────────────────┘
    │   │
    │   └─ repairRequestId = UUID
    │
    ├─ Step 2: Insert repair_request_services
    │   │
    │   ▼
    │   ┌──────────────────────────────────────────────┐
    │   │ INSERT INTO repair_request_services         │
    │   │ (repair_request_id, service_id,           │
    │   │  selected_option_id, service_price, ...)   │
    │   │ VALUES                                   │
    │   │   (repairRequestId, service1UUID, ...)     │
    │   │   (repairRequestId, service2UUID, ...)     │
    │   │   ...                                    │
    │   └──────────────────────────────────────────────┘
    │   │
    │   └─ Error?
    │       ├─ YES → Rollback: DELETE repair_request
    │       └─ NO → Return success
    │
    ▼
Return: RepairRequest object
    │
    ▼
UI: Show success modal
```

---

## Admin Authentication Flow

```
┌─────────────────────────────────────────┐
│        Navigate to /admin              │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ AdminApp     │
        │              │
        │ Check:       │
        │ isAuthenticated?│
        └──────┬───────┘
               │
         ┌─────┴─────┐
         │           │
        YES         NO
         │           │
         ▼           ▼
┌──────────────┐  ┌──────────────┐
│ AdminLayout  │  │ LoginPage    │
│              │  │              │
│ - Sidebar    │  │ - Email form │
│ - Dashboard  │  │ - Password   │
│ - Content    │  └──────┬───────┘
└──────────────┘         │
                        ▼
               ┌────────────────┐
               │ User submits │
               │ credentials  │
               └──────┬───────┘
                      │
                      ▼
              ┌──────────────────┐
              │ AuthContext     │
              │ login()        │
              │                │
              │ Query:         │
              │ admin_users     │
              │ WHERE email = ? │
              │ AND password = ?│
              └──────┬─────────┘
                     │
            ┌────────┴────────┐
            │                 │
          Match           No Match
            │                 │
            ▼                 ▼
   ┌───────────┐    ┌───────────┐
   │ Set state: │    │ Show error│
   │ auth=true  │    │ message   │
   │ user = {...}│   └───────────┘
   └─────┬─────┘
         │
         ▼
┌──────────────┐
│ Navigate to │
│ Dashboard   │
└──────────────┘
```

---

## Data Fetching Pattern

### useServicesWithPricing Hook

```
Component Mount
    │
    ▼
useEffect([controllerModelId])
    │
    ├─ loading = true
    │
    ├─ Fetch: getServicesWithPricing(controllerModelId)
    │   │
    │   ▼
    │   ┌────────────────────────────────────────────┐
    │   │ Supabase Query:                        │
    │   │ SELECT * FROM controller_services        │
    │   │ WHERE controller_model_id = $1          │
    │   │ AND is_active = true                   │
    │   │ ORDER BY display_order                  │
    │   │                                        │
    │   │ + For each service:                    │
    │   │   SELECT * FROM controller_service_     │
    │   │   options                              │
    │   │   WHERE controller_service_id = ?        │
    │   └────────────────────────────────────────────┘
    │   │
    │   ▼
    │   Return: ControllerServiceWithOptions[]
    │
    ├─ setServices(data)
    │
    ├─ loading = false
    │
    └─ Return: { services, loading, error }
```

---

## Component Data Flow

### Service Selection Pricing Calculation

```
User selects services
    │
    ▼
State: selectedServices (Set<serviceId>)
    │
    ┌─────────────────────────────────────────────────┐
    │ Calculate Subtotal:                          │
    │                                             │
    │ foreach service in selectedServices:            │
    │   subtotal += service.base_price                │
    │                                             │
    │   if service has selected option:             │
    │     subtotal += option.additional_price          │
    └─────────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────────┐
    │ Find Applicable Combos:                       │
    │                                             │
    │ combos.filter(combo =>                       │
    │   combo.required_service_ids.every(id =>       │
    │     selectedServices.has(id)                   │
    │   )                                         │
    │ )                                           │
    └─────────────────────────────────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────────┐
    │ Calculate Best Discount:                       │
    │                                             │
    │ foreach combo in applicableCombos:             │
    │   if combo.type = 'percentage':               │
    │     discount = subtotal * (value / 100)       │
    │   else if combo.type = 'fixed':             │
    │     discount = value                         │
    │                                             │
    │   keep max(discount)                         │
    └─────────────────────────────────────────────────┘
    │
    ▼
State:
  - subtotal: number
  - discount: number
  - total: subtotal - discount
  - discountName: combo.name
```

---

## Admin Status Update Flow

```
Admin: Change repair status
    │
    ▼
RepairsPage
    │
    ├─ Select repair request
    ├─ Select new status (dropdown)
    └─ Click "Update Status"
        │
        ▼
API: Update repair request
    │
    ┌──────────────────────────────────────────────┐
    │ Step 1: Insert status_history              │
    │                                          │
    │ INSERT INTO status_history                  │
    │ (repair_request_id,                       │
    │  previous_status,                          │
    │  new_status,                              │
    │  changed_by,                              │
    │  notes)                                  │
    │ VALUES (...)                               │
    └──────────────────────────────────────────────┘
    │
    ▼
    ┌──────────────────────────────────────────────┐
    │ Step 2: Update repair_requests             │
    │                                          │
    │ UPDATE repair_requests                     │
    │ SET status = new_status,                   │
    │     updated_at = NOW()                    │
    │ WHERE id = repair_request_id               │
    └──────────────────────────────────────────────┘
    │
    ▼
Refresh repair requests list
    │
    ▼
UI: Show updated status in table
```

---

## Component Lifecycle Diagrams

### ServiceSelection Component

```
┌─────────────────────────────────────────────────────────────┐
│ Mount:                                                   │
│                                                          │
│  useEffect(() => {                                        │
│    if (!controllerModel) {                               │
│      navigate('/controllers')  ← Validation              │
│    }                                                     │
│                                                          │
│    loadServices()  ← Fetch data                           │
│  }, [controllerModelId])                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Data Loaded
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Render:                                                   │
│                                                          │
│  - Display progress indicator (○──●──○)                    │
│  - Map services to cards                                   │
│  - Calculate pricing (subtotal, discount, total)             │
│  - Show best combo discount                                │
│  - Sticky bottom bar with "계속하기" button                │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User selects services
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Update:                                                   │
│                                                          │
│  toggleService(serviceId)  ← State update                  │
│    ├─ Add/remove from Set                                 │
│    ├─ Update selectedOptions (remove if service removed)      │
│    └─ Recalculate pricing                                 │
│                                                          │
│  selectOption(serviceId, optionId)                          │
│    └─ Update selectedOptions map                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ User clicks "계속하기"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Navigate:                                                 │
│                                                          │
│  navigate('/repair/form', {                               │
│    state: {                                               │
│      controllerModel,                                      │
│      selectionData: {                                      │
│        services: [...],  ← With UUIDs from DB             │
│        subtotal,                                           │
│        discount,                                           │
│        total                                               │
│      }                                                     │
│    }                                                       │
│  })                                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Component unmounts
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Cleanup (useEffect return):                                │
│                                                          │
│  return () => {                                           │
│    setServices([])         ← Clear cached data           │
│    setSelectedServices(new Set())                            │
│    setSelectedOptions({})                                   │
│    setLoading(false)                                       │
│  }                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation State Flow

```
HomeScreen (/)
    │
    │ navigate('/controllers')
    ▼
ControllerSelection (/controllers)
    │
    │ Selected: controllerModelId (UUID)
    │ navigate('/services', {
    │   state: { controllerModel }
    │ })
    ▼
ServiceSelection (/services)
    │
    │ location.state.controllerModel = UUID
    │ Fetch services by controllerModelId
    │
    │ Selected: services[], options[]
    │ navigate('/repair/form', {
    │   state: {
    │     controllerModel,
    │     selectionData: {
    │       services: [{ uuid, id, name, price, ... }],
    │       subtotal, discount, total
    │     }
    │   }
    │ })
    ▼
RepairForm (/repair/form)
    │
    │ location.state.selectionData = {...}
    │ Display summary and form
    │
    │ Submitted → API call
    │
    │ navigate('/')  ← Back to home
```

---

## API Layer Architecture

```
┌────────────────────────────────────────────────────────────┐
│               React Component                              │
│                                                          │
│  RepairForm component                                     │
│  - Form data (state)                                     │
│  - Submit handler                                         │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ Call API function
                     ▼
┌────────────────────────────────────────────────────────────┐
│          API Layer (src/lib/api.ts)                      │
│                                                          │
│  export async function createRepairRequest(params) {        │
│    // Business logic here                                  │
│    // Transaction handling                                 │
│    // Error handling                                     │
│  }                                                        │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ Supabase client calls
                     ▼
┌────────────────────────────────────────────────────────────┐
│         Supabase Client (src/lib/supabase.ts)          │
│                                                          │
│  export const supabase = createClient<Database>(...)     │
└────────────────────┬───────────────────────────────────────┘
                     │
                     │ HTTP requests
                     ▼
┌────────────────────────────────────────────────────────────┐
│          Supabase Backend (PostgreSQL)                    │
│                                                          │
│  - Execute SQL queries                                   │
│  - Enforce RLS policies                                 │
│  - Return data or error                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Database Table Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                     controller_models                         │
│  ┌────────┬────────┬────────┬────────┬────────┬──────┐ │
│  │   id   │model_id│model_nm│is_active│display│  │
│  │  UUID  │  TEXT  │  TEXT  │ BOOLEAN │  int  │  │
│  └────────┴────────┴────────┴────────┴────────┴──────┘ │
│                           │ 1                              │
│                           │                                │
│                           │ *                              │
└───────────────────────────┬─┴──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   controller_services                       │
│  ┌────────┬──────────┬──────────┬──────────┬──────┐ │
│  │   id   │controller│service_id│ base_price│  ... │ │
│  │  UUID  │ _model_id│   TEXT   │ NUMERIC   │      │ │
│  └────────┴──────────┴──────────┴──────────┴──────┘ │
│                           │ 1                              │
│                           │                                │
│                           │ *                              │
└───────────────────────────┬─┴──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               controller_service_options                     │
│  ┌────────┬──────────────┬──────────┬──────────┐     │
│  │   id   │ controller   │option_nam│additional│     │
│  │  UUID  │_service_id  │   TEXT   │  price   │     │
│  └────────┴──────────────┴──────────┴──────────┘     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    repair_requests                          │
│  ┌────────┬──────────┬──────────┬──────────┬──────┐ │
│  │   id   │  customer │ controller│  status  │  ... │ │
│  │  UUID  │  _name   │  _model  │  TEXT    │      │ │
│  └────────┴──────────┴──────────┴──────────┴──────┘ │
│                           │ 1                              │
│                           │                                │
│                           │ *                              │
└───────────────────────────┬─┴──────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                 repair_request_services                      │
│  ┌────────┬──────────┬──────────┬──────────┬──────┐ │
│  │   id   │ repair_rq│service_id│ selected_ │  ... │ │
│  │  UUID  │   _id    │  UUID    │option_id │      │ │
│  └────────┴──────────┴──────────┴──────────┴──────┘ │
└──────────────────────────────────────────────────────────────┘
         │                               │
         │ FK: services.id               │ FK: service_options.id
         │ (SHOULD BE:                    │ (SHOULD BE: controller_service_options.id)
         │ controller_services.id)         │
         ▼                               ▼
┌────────────────┐              ┌────────────────────┐
│   services    │              │  service_options   │
│  ┌────────┐  │              │   ┌───────────┐ │
│  │  id    │  │              │   │ id        │ │
│  │  UUID  │  │              │   │  UUID    │ │
│  └────────┘  │              │   └───────────┘ │
│  ┌────────┐  │              └────────────────────┘
│  │ ...    │  │
│  └────────┘  │
└────────────────┘
```

---

## Error Handling Flow

```
User Action (API Call)
    │
    ▼
┌─────────────────────────────────────┐
│  Try: Execute API function       │
└──────────┬──────────────────────┘
           │
           ├─ SUCCESS
           │   │
           │   ▼
           │  ┌─────────────────────┐
           │  │ Return data       │
           │  │ Update UI         │
           │  └─────────────────────┘
           │
           └─ ERROR
               │
               ▼
          ┌────────────────────────────────┐
          │ Catch Error                 │
          │                            │
          │ Actions:                   │
          │ 1. Set error state        │
          │ 2. Log to console        │
          │ 3. Rollback if needed     │
          │ 4. Show error message    │
          └────────────────────────────────┘
                      │
                      ▼
              ┌─────────────────────┐
              │ Display to User    │
              │ Error alert/modal  │
              └─────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Vercel Deployment                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Git Repository                                 │   │
│  │  - Push to main branch                          │   │
│  │  - Auto-trigger Vercel deployment               │   │
│  └──────────────────┬────────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Vercel Build                                  │   │
│  │  - npm run build                                │   │
│  │  - Output: /dist                               │   │
│  │  - PWA assets generated                         │   │
│  └──────────────────┬────────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │  CDN Edge Network                               │   │
│  │  - Static assets cached                         │   │
│  │  - Global distribution                          │   │
│  │  - HTTPS automatically                         │   │
│  └──────────────────┬────────────────────────────────┘   │
│                     │                                    │
│                     ▼                                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │  User Browser                                  │   │
│  │  - Progressive Web App (PWA)                   │   │
│  │  - Service Worker for offline                   │   │
│  │  - Installable on mobile                       │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Capacitor Mobile App Build Flow

```
Web Build
    │
    │ npm run build
    ▼
/dist folder
    │
    │ npx cap sync
    ▼
Capacitor Sync
    │
    ├─ Copy /dist to /ios/www
    ├─ Copy /dist to /android/app/src/main/assets/public
    └─ Update native config
    │
    ▼
┌──────────────────┐    ┌──────────────────┐
│ iOS Project     │    │ Android Project   │
│ (Xcode)        │    │ (Android Studio) │
│                │    │                 │
│ Build .ipa     │    │ Build .aab      │
│                │    │                 │
│ Upload to      │    │ Upload to       │
│ App Store      │    │ Play Store      │
└──────────────────┘    └──────────────────┘
```
