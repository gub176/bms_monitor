import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // 增加数据库查询超时时间（默认 30 秒）
  db: {
    schema: 'public',
  },
})

// 全局设置 fetch 超时
const originalFetch = globalThis.fetch;
globalThis.fetch = (url, options = {}) => {
  // 为 Supabase API 请求增加超时时间到 60 秒
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('supabase.co')) {
    options.signal = AbortSignal.timeout(60000);
  }
  return originalFetch(url, options);
};
