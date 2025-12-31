<template>
  <div class="k-card p-5">
    <div class="font-semibold mb-4">💿 Import Full Album</div>

    <div class="flex gap-3 mb-6">
      <input
        v-model="query"
        type="text"
        placeholder="Album name + artist"
        class="k-inp flex-1"
        @keyup.enter="search"
      />
      <button class="k-btn" :disabled="loading" @click="search">
        {{ loading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <div class="mb-4">
      <label class="text-sm opacity-80">Genre for all tracks:</label>
      <input v-model="importGenre" class="k-inp mt-1 w-48" placeholder="Hip-Hop" />
    </div>

    <div v-if="results.length > 0 && !selectedAlbum" class="space-y-2">
      <div
        v-for="album in results"
        :key="album.id"
        class="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/25"
        @click="loadAlbum(album.id)"
      >
        <img v-if="album.coverUrl" :src="album.coverUrl" class="w-16 h-16 rounded-lg object-cover" />
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ album.name }}</div>
          <div class="text-sm opacity-60 truncate">{{ album.artist }}</div>
        </div>
        <span class="text-sm opacity-50">View tracks →</span>
      </div>
    </div>

    <div v-if="selectedAlbum" class="space-y-4">
      <div class="flex items-center gap-4 p-4 rounded-xl border border-[#00A651]/30 bg-[#00A651]/10">
        <img :src="selectedAlbum.coverUrl" class="w-20 h-20 rounded-lg object-cover" />
        <div class="flex-1">
          <div class="text-xl font-bold">{{ selectedAlbum.name }}</div>
          <div class="opacity-70">{{ selectedAlbum.artist }} • {{ selectedAlbum.year }}</div>
          <div class="text-sm opacity-50 mt-1">{{ selectedAlbum.tracks?.length || 0 }} tracks</div>
        </div>
        <div class="flex flex-col gap-2">
          <button class="k-btn" :disabled="importing" @click="importAlbum">
            {{ importing ? 'Importing... (Please Wait)' : 'Import All' }}
          </button>
          <button class="k-btn2" @click="selectedAlbum = null">Back</button>
        </div>
      </div>

      <div v-if="progress" class="p-4 rounded-xl border border-white/10 bg-white/5 max-h-[400px] overflow-auto">
        <div class="font-bold mb-3 border-b border-white/10 pb-2">Import Report</div>
        
        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div class="text-[#00A651]">✅ Success: {{ progress.imported }}</div>
          <div class="text-yellow-400">⏭️ Skipped: {{ progress.skipped }}</div>
        </div>

        <div v-if="progress.errors && progress.errors.length > 0">
          <div class="text-red-400 font-bold mb-2">❌ Failed Songs:</div>
          <div class="space-y-2">
            <div v-for="(err, i) in progress.errors" :key="i" class="text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
              <span class="font-bold text-red-300">{{ err.title || 'Unknown Track' }}:</span> 
              {{ err.error || 'Unknown error' }}
            </div>
          </div>
        </div>
        <div v-else class="text-sm opacity-50">No errors reported.</div>
      </div>

      <div v-if="!progress" class="space-y-1 max-h-[300px] overflow-auto">
        <div v-for="track in selectedAlbum.tracks" :key="track.id" class="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-white/5">
          <span class="text-sm opacity-40 w-6">{{ track.trackNumber }}</span>
          <span class="flex-1 truncate">{{ track.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../../../services/api'

const emit = defineEmits(['refresh', 'toast', 'error'])

const query = ref('')
const results = ref([])
const loading = ref(false)
const selectedAlbum = ref(null)
const importing = ref(false)
const progress = ref(null)
const importGenre = ref('Hip-Hop') // Changed default

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  results.value = []
  selectedAlbum.value = null
  try {
    const { data } = await api.get('/genius/albums/search', { params: { q: query.value } })
    results.value = data || []
  } catch (e) {
    emit('error', 'Search failed', e?.message)
  } finally {
    loading.value = false
  }
}

async function loadAlbum(albumId) {
  try {
    const { data } = await api.get(`/genius/album/${albumId}`)
    selectedAlbum.value = data
    progress.value = null
  } catch (e) {
    emit('error', 'Failed to load album', e?.message)
  }
}

async function importAlbum() {
  if (!selectedAlbum.value) return
  importing.value = true
  progress.value = null
  
  try {
    const { data } = await api.post('/genius/import-album', {
      albumId: selectedAlbum.value.id,
      genre: importGenre.value
    }, { timeout: 600000 }) // 10 minutes timeout

    progress.value = data
    emit('toast', `Import Complete: ${data.imported} added.`)
    emit('refresh')
  } catch (e) {
    emit('error', 'Import crashed', e?.message)
  } finally {
    importing.value = false
  }
}
</script>
