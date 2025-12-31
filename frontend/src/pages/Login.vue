<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="k-card max-w-md w-full p-8 text-center space-y-8">
      
      <div>
        <h1 class="text-3xl font-black mb-2">Welcome Back</h1>
        <p class="opacity-60">Sign in to manage KyriqLab</p>
      </div>

      <a 
        href="https://kyriqlab.com/api/auth/google" 
        class="flex items-center justify-center gap-3 w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign in with Google
      </a>

      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
        <div class="relative flex justify-center text-sm"><span class="bg-[#121212] px-2 opacity-40">OR</span></div>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div class="text-left">
          <label class="text-xs font-bold opacity-60 uppercase ml-1">Admin Key</label>
          <input 
            v-model="apiKey" 
            type="password" 
            placeholder="Enter manual key..." 
            class="k-inp w-full mt-1"
          />
        </div>
        <button type="submit" class="k-btn w-full py-3" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Access Admin Panel' }}
        </button>
      </form>
      
      <p v-if="error" class="text-red-500 font-bold bg-red-500/10 py-2 rounded-lg">
        {{ error }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()
const apiKey = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    localStorage.setItem('adminKey', apiKey.value)
    await api.get('/auth/verify') // Verify key works
    router.push('/admin')
  } catch (e) {
    error.value = 'Invalid API Key'
    localStorage.removeItem('adminKey')
  } finally {
    loading.value = false
  }
}
</script>
