<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold">
          Admin <span class="text-[#00A651]">•</span> Content
        </h1>
        <p class="opacity-80 mt-1 text-sm">Create, edit, publish, delete.</p>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink class="k-btn2" to="/login">Change Key</RouterLink>
        <button class="k-btn2" @click="refresh">Refresh</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mt-6 flex gap-2 border-b border-white/10 pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 rounded-t-lg transition font-medium"
        :class="activeTab === tab.id
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:text-white/80'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="mt-5 k-card p-4 border-[#00A651]/30 bg-[#00A651]/10">
      <div class="text-sm">{{ toast }}</div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-5 k-card p-4 border-red-500/30 bg-red-500/10">
      <div class="font-semibold text-red-400">Error</div>
      <div class="opacity-80 text-sm mt-1">{{ error }}</div>
      <pre v-if="detail" class="opacity-70 text-xs mt-2 whitespace-pre-wrap">{{ detail }}</pre>
    </div>

    <!-- Posts Tab -->
    <div v-if="activeTab === 'posts'" class="mt-6">
      <PostsManager
        ref="postsManager"
        @toast="showToast"
        @error="showError"
      />
    </div>

    <!-- Songs Tab -->
    <div v-if="activeTab === 'songs'" class="mt-6">
      <SongsManager
        ref="songsManager"
        @toast="showToast"
        @error="showError"
      />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import PostsManager from '../components/admin/PostsManager.vue'
import SongsManager from '../components/admin/SongsManager.vue'

const tabs = [
  { id: 'posts', label: 'Posts' },
  { id: 'songs', label: 'Songs' },
]

const activeTab = ref('posts')
const toast = ref('')
const error = ref('')
const detail = ref('')

const postsManager = ref(null)
const songsManager = ref(null)

function showToast(msg) {
  toast.value = msg
  error.value = ''
  detail.value = ''
  setTimeout(() => (toast.value = ''), 2000)
}

function showError(msg, details = '') {
  error.value = msg
  detail.value = details
  toast.value = ''
}

function refresh() {
  if (activeTab.value === 'posts') {
    postsManager.value?.loadAll()
  } else if (activeTab.value === 'songs') {
    songsManager.value?.loadAll()
  }
}
</script>
