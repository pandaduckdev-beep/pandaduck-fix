import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('Running migration: add_icon_name_to_services.sql')

  const migrationPath = path.join(__dirname, '../supabase/migrations/add_icon_name_to_services.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  for (const statement of statements) {
    console.log('Executing:', statement.substring(0, 100) + '...')

    const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

    if (error) {
      console.error('Migration error:', error)
      return
    }
  }

  console.log('✅ Migration completed successfully!')
}

runMigration()
