/**
 * Creates a Supabase Auth user via the Admin API.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Dashboard → Settings → API → service_role).
 * Never commit that key or use it in client code.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const [, , email, password] = process.argv

if (!email || !password) {
  console.error('Usage: npm run create-user -- <email> <password>')
  process.exit(1)
}

if (!url || !serviceRoleKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (error) {
  console.error(error.message)
  process.exit(1)
}

console.log('User created:', data.user?.id, data.user?.email)
