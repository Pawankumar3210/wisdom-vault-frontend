// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Load Supabase URL and Anon Key from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)