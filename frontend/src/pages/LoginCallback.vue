<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center p-4">
    <div class="animate-spin text-4xl mb-4">🔄</div>
    <h2 class="text-xl font-bold">Completing Login...</h2>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const { token, admin, name } = route.query

  if (token) {
    // Save to LocalStorage
    localStorage.setItem('adminKey', token)
    if (name) localStorage.setItem('userName', name)

    // Redirect
    if (admin === 'true') {
      // Use window.location to force a full refresh (ensures Router picks up the new key)
      window.location.href = '/admin'
    } else {
      router.push('/')
    }
  } else {
    router.push('/login?error=missing_token')
  }
})
</script>
