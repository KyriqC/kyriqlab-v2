<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4 animate-pulse">
      <div class="text-4xl">🔐</div>
      <div class="text-xl font-bold">Authenticating...</div>
      <div class="text-sm opacity-50">Please wait while we log you in.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  // 1. Grab data from URL
  const { token, admin, name } = route.query

  if (token) {
    // 2. Save to Browser
    localStorage.setItem('adminKey', token) // We use 'adminKey' for both visitors and admins for now
    localStorage.setItem('userName', name || 'User')
    
    // 3. Redirect
    if (admin === 'true') {
      window.location.href = '/admin' // Force reload to update navbar
    } else {
      window.location.href = '/' // Visitor goes to home
    }
  } else {
    // Failed
    router.push('/login?error=auth_failed')
  }
})
</script>
