// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Vite environment variables must start with VITE_
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)