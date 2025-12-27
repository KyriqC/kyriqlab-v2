<template>
  <div class="min-h-screen">
    <section class="max-w-7xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 class="text-4xl font-bold">Song Library</h1>
          <p class="opacity-70 mt-1">Explore the tracks powering Lyric Blitz</p>
        </div>

        <RouterLink
          to="/lyric-blitz"
          class="k-btn inline-flex items-center gap-2"
        >
          Play Game
          <span>→</span>
        </RouterLink>
      </div>

      <!-- Search and Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-8">
        <!-- Search -->
        <div class="flex-1 relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search songs or artists..."
            class="w-full px-4 py-3 pl-10 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-white/25 transition"
            @input="debouncedSearch"
          />
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Artist Filter -->
        <select
          v-model="selectedArtist"
          class="md:w-64 px-4 py-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-white/25 transition"
          @change="loadSongs(1)"
        >
          <option value="All">All Artists</option>
          <option v-for="artist in artists" :key="artist" :value="artist">
            {{ artist }}
          </option>
        </select>

        <!-- Genre Filter -->
        <select
          v-model="selectedGenre"
          class="md:w-48 px-4 py-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-white/25 transition"
          @change="loadSongs(1)"
        >
          <option value="All">All Genres</option>
          <option v-for="genre in genres" :key="genre" :value="genre">
            {{ genre }}
          </option>
        </select>
      </div>

      <!-- Stats Bar -->
      <div class="flex items-center gap-4 mb-6 text-sm opacity-70">
        <span>{{ total }} songs</span>
        <span v-if="selectedArtist !== 'All'">• {{ selectedArtist }}</span>
        <span v-if="selectedGenre !== 'All'">• {{ selectedGenre }}</span>
        <span v-if="searchQuery">• searching "{{ searchQuery }}"</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 opacity-70 animate-pulse">
        Loading library...
      </div>

      <!-- Empty State -->
      <div v-else-if="songs.length === 0" class="text-center py-12">
        <p class="opacity-70">No songs found matching your criteria.</p>
        <button
          v-if="searchQuery || selectedArtist !== 'All' || selectedGenre !== 'All'"
          class="mt-4 k-btn2"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <!-- Songs Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <RouterLink
          v-for="song in songs"
          :key="song._id"
          :to="`/songs/${song._id}`"
          class="k-card p-4 flex items-center gap-4 hover:translate-y-[-2px] transition group"
        >
          <!-- Album Art or Placeholder -->
          <div class="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="song.coverUrl"
              :src="song.coverUrl"
              :alt="song.title"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-2xl opacity-30">🎵</span>
          </div>

          <!-- Song Info -->
          <div class="overflow-hidden flex-1">
            <h3 class="font-semibold truncate group-hover:text-[#00A651] transition">
              {{ song.title }}
            </h3>
            <p class="text-sm opacity-60 truncate">{{ song.artist }}</p>
            <p v-if="song.album" class="text-xs opacity-40 truncate">{{ song.album }}</p>
          </div>

          <!-- Arrow -->
          <svg
            class="w-5 h-5 opacity-0 group-hover:opacity-50 transition flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-10 flex justify-center items-center gap-2">
        <button
          class="k-btn2"
          :disabled="currentPage <= 1"
          @click="loadSongs(currentPage - 1)"
        >
          ← Prev
        </button>

        <span class="px-4 py-2 text-sm opacity-70">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          class="k-btn2"
          :disabled="currentPage >= totalPages"
          @click="loadSongs(currentPage + 1)"
        >
          Next →
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'

const songs = ref([])
const artists = ref([])
const genres = ref([])
const loading = ref(true)

const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const limit = 48

const searchQuery = ref('')
const selectedArtist = ref('All')
const selectedGenre = ref('All')

let searchTimeout = null

async function loadSongs(page = 1) {
  loading.value = true

  try {
    const params = { page, limit }

    if (searchQuery.value.trim()) {
      params.q = searchQuery.value.trim()
    }
    if (selectedArtist.value !== 'All') {
      params.artist = selectedArtist.value
    }
    if (selectedGenre.value !== 'All') {
      params.genre = selectedGenre.value
    }

    const { data } = await api.get('/songs', { params })
    songs.value = data.items || []
    currentPage.value = data.page || 1
    totalPages.value = data.pages || 1
    total.value = data.total || 0
  } catch (e) {
    console.error('Failed to load songs:', e)
  } finally {
    loading.value = false
  }
}

async function loadFilters() {
  try {
    const [artistsRes, genresRes] = await Promise.all([
      api.get('/songs/artists'),
      api.get('/songs/genres')
    ])
    artists.value = artistsRes.data || []
    genres.value = genresRes.data || []
  } catch (e) {
    console.error('Failed to load filters:', e)
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadSongs(1)
  }, 300)
}

function clearFilters() {
  searchQuery.value = ''
  selectedArtist.value = 'All'
  selectedGenre.value = 'All'
  loadSongs(1)
}

onMounted(() => {
  loadFilters()
  loadSongs(1)
})
</script>
