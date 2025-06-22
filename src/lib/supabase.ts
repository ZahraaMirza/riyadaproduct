import { createClient } from '@supabase/supabase-js'

// Vite uses `import.meta.env` to access environment variables

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Add a check to ensure credentials are provided
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error("Supabase URL is not provided. Make sure to create a .env file with VITE_SUPABASE_URL.");
}
if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error("Supabase anonymous key is not provided. Make sure to create a .env file with VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Booking {
  id?: number
  name: string
  phone: string
  startups: string[]
  room_id: string
  created_at?: string
}

export interface Room {
  id: string
  name: string
  startups: Startup[]
}

export interface Startup {
  id: string
  name: string
  spots: number
  room_id: string
} 