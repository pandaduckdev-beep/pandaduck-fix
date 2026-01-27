import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Note: We need service role key for schema changes
// For now, let's just verify the column doesn't exist and guide manual addition
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY || '')

async function addIconColumn() {
  console.log('Checking controller_services table schema...')

  // Check if we can query the table
  const { data, error } = await supabase
    .from('controller_services')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error querying table:', error)
    return
  }

  console.log('Current columns:', Object.keys(data[0] || {}))
  console.log('\n⚠️  Manual step required:')
  console.log('Please run this SQL in Supabase SQL Editor:')
  console.log('\nALTER TABLE controller_services')
  console.log("ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50);")
  console.log('\nAfter running the SQL, press Enter to continue...')
}

addIconColumn()
