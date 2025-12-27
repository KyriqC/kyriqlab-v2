<template>
  <div class="min-h-screen">
    <section class="max-w-4xl mx-auto px-4 py-10">
      <!-- Back Link -->
      <RouterLink
        to="/song-library"
        class="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition mb-6"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 opacity-70 animate-pulse">
        Loading song...
      </div>

      <!-- Error -->
      <div v-else-if="error" class="k-card p-6">
        <div class="font-semibold">Error</div>
        <div class="opacity-70 text-sm mt-1">{{ error }}</div>
        <RouterLink to="/song-library" class="k-btn2 mt-4 inline-block">
          Back to Library
        </RouterLink>
      </div>

      <!-- Song Content -->
      <div v-else-if="song" class="space-y-6">
        <!-- Header Card -->
        <div class="k-card p-6 flex flex-col md:flex-row gap-6">
          <!-- Album Art -->
          <div class="w-full md:w-48 h-48 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="song.coverUrl"
              :src="song.coverUrl"
              :alt="song.title"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-6xl opacity-20">🎵</span>
          </div>

          <!-- Song Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold">{{ song.title }}</h1>
            <p class="text-xl opacity-80 mt-1">{{ song.artist }}</p>

            <div class="mt-4 flex flex-wrap gap-3">
              <span
                v-if="song.album"
                class="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-sm"
              >
                📀 {{ song.album }}
              </span>
              <span
                v-if="song.year && song.year !== 'Unknown'"
                class="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-sm"
              >
                📅 {{ song.year }}
              </span>
              <span
                v-if="song.genre"
                class="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-sm"
              >
                🎵 {{ song.genre }}
              </span>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-3">
              <RouterLink
                to="/lyric-blitz"
                class="k-btn inline-flex items-center gap-2"
              >
                Play Lyric Blitz
              </RouterLink>
              <button
                class="k-btn2"
                @click="copyLyrics"
              >
                {{ copied ? 'Copied!' : 'Copy Lyrics' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Lyrics Card -->
        <div class="k-card p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>Lyrics</span>
            <span class="text-xs px-2 py-0.5 rounded border border-white/10 bg-white/5 opacity-60">
              {{ lineCount }} lines
            </span>
          </h2>

          <div
            v-if="song.lyrics"
            class="whitespace-pre-line leading-relaxed opacity-90 font-serif text-lg"
          >
            {{ song.lyrics }}
          </div>

          <div v-else class="opacity-50 italic">
            No lyrics available for this song.
          </div>
        </div>

        <!-- Metadata -->
        <div class="text-xs opacity-50 text-center">
          Added {{ formatDate(song.createdAt) }}
          <span v-if="song.geniusId">• Genius ID: {{ song.geniusId }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '../services/api'

const route = useRoute()

const song = ref(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)

const lineCount = computed(() => {
  if (!song.value?.lyrics) return 0
  return song.value.lyrics.split('\n').filter(line => line.trim()).length
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function copyLyrics() {
  if (!song.value?.lyrics) return

  try {
    await navigator.clipboard.writeText(song.value.lyrics)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/songs/${route.params.id}`)
    song.value = data
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load song'
  } finally {
    loading.value = false
  }
})
</script>
