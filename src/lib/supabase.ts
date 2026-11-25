import {createClient} from '@supabase/supabase-js'
const { VITE_SUPABASE_URL:url,VITE_SUPABASE_PUBLISHABLE_KEY:key }=import.meta.env
const publishable=typeof key==='string'&&key.startsWith('sb_publishable_')
export const supabase=url&&publishable ? createClient(url,key) : null
