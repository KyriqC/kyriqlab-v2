<template>
  <div class="k-card p-5">
    <div class="font-semibold mb-4">🔍 Search Genius for Songs</div>

    <div class="flex gap-3 mb-6">
      <input
        v-model="query"
        type="text"
        placeholder="Search song or artist..."
        class="k-inp flex-1"
        @keyup.enter="search"
      />
      <button class="k-btn" :disabled="loading" @click="search">
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <div class="mb-4">
      <label class="text-sm opacity-80">Genre for imports:</label>
      <input v-model="importGenre" class="k-inp mt-1 w-48" placeholder="Hip-Hop" />
    </div>

    <div v-if="results.length > 0" class="space-y-2">
      <div
        v-for="result in results"
        :key="result.id"
        class="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5"
      >
        <img
          v-if="result.thumbnail"
          :src="result.thumbnail"
          class="w-12 h-12 rounded-lg object-cover"
        />
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ result.title }}</div>
          <div class="text-sm opacity-60 truncate">{{ result.artist }}</div>
        </div>
        <button
          class="k-btn text-sm"
          :disabled="importingId === result.id"
          @click="importSong(result.id)"
        >
          {{ importingId === result.id ? 'Importing...' : 'Import' }}
        </button>
      </div>
    </div>

    <div v-else-if="searched" class="text-center py-8 opacity-50">
      No results found
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../../../services/api'

const emit = defineEmits(['refresh', 'toast', 'error'])

const query = ref('')
const results = ref([])
const searched = ref(false)
const loading = ref(false)
const importingId = ref(null)
const importGenre = ref('Soul')

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  searched.value = false
  results.value = []

  try {
    const { data } = await api.get('/genius/search', { params: { q: query.value } })
    results.value = data || []
    searched.value = true
  } catch (e) {
    emit('error', 'Search failed', e?.message)
  } finally {
    loading.value = false
  }
}

async function importSong(geniusId) {
  importingId.value = geniusId
  try {
    await api.post('/genius/import-song', {
      geniusId,
      genre: importGenre.value || 'Hip-Hop'
    })
    emit('toast', 'Song imported ✅')
    emit('refresh')
  } catch (e) {
    if (e?.response?.status === 409) emit('toast', 'Song already exists')
    else emit('error', 'Import failed', e?.message)
  } finally {
    importingId.value = null
  }
}
</script>
