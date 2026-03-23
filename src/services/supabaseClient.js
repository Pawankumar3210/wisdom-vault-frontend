// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Create the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

// Default export for compatibility with current imports
export default {supabase}