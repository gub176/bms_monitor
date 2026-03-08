import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  setAuth: (user: User | null, session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  setAuth: (user, session) => {
    set({ user, session, loading: false })
  },

  setLoading: (loading) => {
    set({ loading })
  },

  setError: (error) => {
    set({ error, loading: false })
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        set({ error: error.message })
        return { error: error.message }
      }
      set({ user: data.user, session: data.session, error: null })
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败'
      set({ error: message })
      return { error: message }
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        set({ error: error.message })
        return { error: error.message }
      }
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败'
      set({ error: message })
      return { error: message }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, error: null })
  },

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        })
      })
    } catch (err) {
      console.error('Failed to initialize auth:', err)
      set({ loading: false, error: '认证初始化失败' })
    }
  },
}))
