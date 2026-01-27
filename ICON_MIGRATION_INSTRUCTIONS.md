# Icon Name Column Migration Instructions

## Overview
This migration adds an `icon_name` column to the `controller_services` table to allow multiple services to use the same icon.

## Manual SQL Migration Required

Since we don't have direct database access through CLI tools, you need to run the SQL migration manually in the Supabase SQL Editor.

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ksdzieewawqxoknnptsj
2. Navigate to: **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Add icon_name column to controller_services table
ALTER TABLE controller_services
ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50);

-- Add comment to explain the column
COMMENT ON COLUMN controller_services.icon_name IS 'Icon name from lucide-react library (e.g., controller, cpu, wrench)';
```

5. Click **Run** or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (Mac)
6. Verify the migration succeeded

### What's Changed:

**Before:** Icons were tied to `service_id`, preventing icon duplication across services.
**After:** Icons are stored in the new `icon_name` column, allowing the same icon for multiple services.

### Code Changes Already Applied:

✅ **EditServiceModal.tsx** - Now saves selected icon to `icon_name` field
✅ **ServicesPage.tsx** (Admin) - Reads icon from `icon_name` field
✅ **ServicesPage.tsx** (Customer) - Reads icon from `icon_name` field
✅ **ServiceSelection.tsx** - Reads icon from `icon_name` field
✅ **database.ts** - TypeScript types updated to include `icon_name`

### Backward Compatibility:

The code includes fallback logic: `service.icon_name || service.service_id`
- If `icon_name` exists, use it
- Otherwise, fall back to `service_id` (old behavior)

This ensures existing services continue to work while the migration is being applied.

### After Migration:

Once the SQL is executed:
1. Edit any service in the admin panel
2. Select an icon from the icon selector
3. Save the service
4. The icon will be saved to the `icon_name` column
5. You can now use the same icon for multiple services

### Testing:

1. Run the SQL migration
2. Edit two different services
3. Select the same icon for both
4. Save both services
5. Verify both services display the same icon
6. This confirms icons can now be duplicated across services

---

**Note:** The migration SQL file is located at:
`supabase/migrations/add_icon_name_to_services.sql`
