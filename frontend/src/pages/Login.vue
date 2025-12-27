<template>
  <section class="max-w-lg mx-auto px-4 py-12">
    <h1 class="text-2xl font-semibold">Admin Login</h1>
    <p class="opacity-80 mt-2">Enter your admin key to enable create/edit actions.</p>

    <div class="mt-6 p-6 rounded-xl border border-white/10">
      <label class="block text-sm opacity-80 mb-2">Admin Key</label>
      <input
        v-model="key"
        type="password"
        class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-white/25"
        placeholder="Paste ADMIN_API_KEY"
      />

      <div class="mt-4 flex items-center gap-3">
        <button
          class="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 transition"
          @click="save"
        >
          Save
        </button>

        <button
          class="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition opacity-80"
          @click="logout"
        >
          Clear
        </button>

        <span v-if="saved" class="text-sm opacity-80">Saved ✅</span>
      </div>

      <p v-if="error" class="mt-4 text-sm border border-white/10 bg-white/5 rounded-lg p-3">
        {{ error }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setAdminKey, clearAdminKey, getAdminKey } from '../services/auth'

const route = useRoute()
const router = useRouter()

const key = ref(getAdminKey())
const saved = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  const v = key.value.trim()
  if (!v) {
    error.value = 'Admin key is required.'
    return
  }

  try {
    const res = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: { 'x-admin-key': v },
    })

    if (!res.ok) {
      error.value = 'Invalid admin key.'
      return
    }

    setAdminKey(v)
    saved.value = true
    setTimeout(() => (saved.value = false), 1200)

    const next = route.query.next || '/admin'
    router.push(next)
  } catch (e) {
    error.value = 'Could not reach server to verify key.'
  }
}




function logout() {
  clearAdminKey()
  key.value = ''
  saved.value = false
  error.value = 'Admin key cleared.'
}
</script>
