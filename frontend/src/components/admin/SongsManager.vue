<template>
  <div class="space-y-6">
    <!-- Top Actions -->
    <div class="flex flex-wrap gap-3">
      <button
        class="k-btn"
        :class="mode === 'list' ? 'opacity-100' : 'opacity-60'"
        @click="mode = 'list'"
      >
        📋 Song List
      </button>
      <button
        class="k-btn"
        :class="mode === 'search' ? 'opacity-100' : 'opacity-60'"
        @click="mode = 'search'"
      >
        🔍 Search Genius
      </button>
      <button
        class="k-btn"
        :class="mode === 'album' ? 'opacity-100' : 'opacity-60'"
        @click="mode = 'album'"
      >
        💿 Import Album
      </button>
      <button
        class="k-btn"
        :class="mode === 'manual' ? 'opacity-100' : 'opacity-60'"
        @click="mode = 'manual'; resetManualForm()"
      >
        ✏️ Add Manual
      </button>
    </div>

    <!-- Song List Mode -->
    <div v-if="mode === 'list'" class="grid lg:grid-cols-3 gap-6">
      <!-- Left: List -->
      <div class="lg:col-span-1 k-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="font-semibold">Songs ({{ songs.length }})</div>
        </div>

        <!-- Search -->
        <input
          v-model="listSearch"
          type="text"
          placeholder="Filter songs..."
          class="k-inp mb-4"
          @input="filterSongs"
        />

        <div class="space-y-2 max-h-[500px] overflow-auto">
          <button
            v-for="s in filteredSongs"
            :key="s._id"
            class="w-full text-left rounded-xl border border-white/10 hover:border-white/25 bg-white/5 px-3 py-3 transition"
            :class="selectedSong?._id === s._id ? 'ring-2 ring-[#00A651]/60' : ''"
            @click="selectSong(s)"
          >
            <div class="font-medium truncate">{{ s.title }}</div>
            <div class="text-xs opacity-60 truncate">{{ s.artist }}</div>
          </button>

          <div v-if="filteredSongs.length === 0" class="text-center py-4 opacity-50">
            No songs found
          </div>
        </div>
      </div>

      <!-- Right: Editor -->
      <div class="lg:col-span-2 k-card p-5">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="font-semibold">{{ selectedSong ? 'Edit Song' : 'Select a song' }}</div>
          <div class="flex gap-2">
            <button
              class="k-btn"
              :disabled="!selectedSong || savingSong"
              @click="updateSong"
            >
              {{ savingSong ? 'Saving...' : 'Save' }}
            </button>
            <button
              class="k-btn2"
              :disabled="!selectedSong || deletingSong"
              @click="deleteSong"
            >
              {{ deletingSong ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>

        <div v-if="selectedSong" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm opacity-80">Title</label>
              <input v-model="editForm.title" class="k-inp mt-1" />
            </div>
            <div>
              <label class="text-sm opacity-80">Artist</label>
              <input v-model="editForm.artist" class="k-inp mt-1" />
            </div>
            <div>
              <label class="text-sm opacity-80">Album</label>
              <input v-model="editForm.album" class="k-inp mt-1" />
            </div>
            <div>
              <label class="text-sm opacity-80">Year</label>
              <input v-model="editForm.year" class="k-inp mt-1" />
            </div>
            <div>
              <label class="text-sm opacity-80">Genre</label>
              <input v-model="editForm.genre" class="k-inp mt-1" />
            </div>
            <div class="flex items-center gap-3 mt-6">
              <input id="isActive" type="checkbox" v-model="editForm.isActive" />
              <label for="isActive" class="text-sm opacity-80">Active (used in game)</label>
            </div>
          </div>

          <div>
            <label class="text-sm opacity-80">Lyrics</label>
            <textarea v-model="editForm.lyrics" class="k-inp mt-1 h-64 font-mono text-sm"></textarea>
          </div>
        </div>

        <div v-else class="text-center py-12 opacity-50">
          Select a song from the list to edit
        </div>
      </div>
    </div>

    <!-- Search Genius Mode -->
    <div v-if="mode === 'search'" class="k-card p-5">
      <div class="font-semibold mb-4">🔍 Search Genius for Songs</div>

      <div class="flex gap-3 mb-6">
        <input
          v-model="geniusQuery"
          type="text"
          placeholder="Search song or artist..."
          class="k-inp flex-1"
          @keyup.enter="searchGenius"
        />
        <button class="k-btn" :disabled="searchingGenius" @click="searchGenius">
          {{ searchingGenius ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <!-- Genre selector -->
      <div class="mb-4">
        <label class="text-sm opacity-80">Genre for imports:</label>
        <input v-model="importGenre" class="k-inp mt-1 w-48" placeholder="Hip-Hop" />
      </div>

      <!-- Results -->
      <div v-if="geniusResults.length > 0" class="space-y-2">
        <div
          v-for="result in geniusResults"
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
            :disabled="importingSongId === result.id"
            @click="importSong(result.id)"
          >
            {{ importingSongId === result.id ? 'Importing...' : 'Import' }}
          </button>
        </div>
      </div>

      <div v-else-if="geniusSearched" class="text-center py-8 opacity-50">
        No results found
      </div>
    </div>

    <!-- Album Import Mode -->
    <div v-if="mode === 'album'" class="k-card p-5">
      <div class="font-semibold mb-4">💿 Import Full Album from Genius</div>

      <div class="flex gap-3 mb-6">
        <input
          v-model="albumQuery"
          type="text"
          placeholder="Album name + artist (e.g., 'Musiquarium Stevie Wonder')"
          class="k-inp flex-1"
          @keyup.enter="searchAlbums"
        />
        <button class="k-btn" :disabled="searchingAlbums" @click="searchAlbums">
          {{ searchingAlbums ? 'Searching...' : 'Search' }}
        </button>
      </div>

      <!-- Genre selector -->
      <div class="mb-4">
        <label class="text-sm opacity-80">Genre for all tracks:</label>
        <input v-model="importGenre" class="k-inp mt-1 w-48" placeholder="Hip-Hop" />
      </div>

      <!-- Album Results -->
      <div v-if="albumResults.length > 0 && !selectedAlbum" class="space-y-2">
        <div
          v-for="album in albumResults"
          :key="album.id"
          class="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/25"
          @click="loadAlbum(album.id)"
        >
          <img
            v-if="album.coverUrl"
            :src="album.coverUrl"
            class="w-16 h-16 rounded-lg object-cover"
          />
          <div class="flex-1 min-w-0">
            <div class="font-medium truncate">{{ album.name }}</div>
            <div class="text-sm opacity-60 truncate">{{ album.artist }}</div>
          </div>
          <span class="text-sm opacity-50">Click to view tracks →</span>
        </div>
      </div>

      <!-- Selected Album with Tracks -->
      <div v-if="selectedAlbum" class="space-y-4">
        <div class="flex items-center gap-4 p-4 rounded-xl border border-[#00A651]/30 bg-[#00A651]/10">
          <img
            v-if="selectedAlbum.coverUrl"
            :src="selectedAlbum.coverUrl"
            class="w-20 h-20 rounded-lg object-cover"
          />
          <div class="flex-1">
            <div class="text-xl font-bold">{{ selectedAlbum.name }}</div>
            <div class="opacity-70">{{ selectedAlbum.artist }} • {{ selectedAlbum.year }}</div>
            <div class="text-sm opacity-50 mt-1">{{ selectedAlbum.tracks?.length || 0 }} tracks</div>
          </div>
          <div class="flex flex-col gap-2">
            <button
              class="k-btn"
              :disabled="importingAlbum"
              @click="importAlbum"
            >
              {{ importingAlbum ? 'Importing...' : 'Import All' }}
            </button>
            <button class="k-btn2" @click="selectedAlbum = null">
              Back
            </button>
          </div>
        </div>

        <!-- Track List -->
        <div class="space-y-1 max-h-[400px] overflow-auto">
          <div
            v-for="track in selectedAlbum.tracks"
            :key="track.id"
            class="flex items-center gap-3 p-2 rounded-lg border border-white/5 bg-white/5"
          >
            <span class="text-sm opacity-40 w-6">{{ track.trackNumber }}</span>
            <span class="flex-1 truncate">{{ track.title }}</span>
            <span class="text-sm opacity-50">{{ track.artist }}</span>
          </div>
        </div>

        <!-- Import Progress -->
        <div v-if="importProgress" class="p-4 rounded-xl border border-white/10 bg-white/5">
          <div class="font-medium mb-2">Import Progress</div>
          <div class="text-sm space-y-1">
            <div class="text-[#00A651]">✅ Imported: {{ importProgress.imported }}</div>
            <div class="opacity-60">⏭️ Skipped (duplicates): {{ importProgress.skipped }}</div>
            <div v-if="importProgress.errors?.length" class="text-red-400">
              ❌ Errors: {{ importProgress.errors.length }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="albumsSearched && albumResults.length === 0" class="text-center py-8 opacity-50">
        No albums found. Try including the artist name.
      </div>
    </div>

    <!-- Manual Add Mode -->
    <div v-if="mode === 'manual'" class="k-card p-5">
      <div class="flex items-center justify-between mb-4">
        <div class="font-semibold">✏️ Add Song Manually</div>
        <button
          class="k-btn"
          :disabled="savingManual"
          @click="saveManual"
        >
          {{ savingManual ? 'Saving...' : 'Save Song' }}
        </button>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm opacity-80">Title *</label>
          <input v-model="manualForm.title" class="k-inp mt-1" placeholder="Song title" />
        </div>
        <div>
          <label class="text-sm opacity-80">Artist *</label>
          <input v-model="manualForm.artist" class="k-inp mt-1" placeholder="Artist name" />
        </div>
        <div>
          <label class="text-sm opacity-80">Album</label>
          <input v-model="manualForm.album" class="k-inp mt-1" placeholder="Album name" />
        </div>
        <div>
          <label class="text-sm opacity-80">Year</label>
          <input v-model="manualForm.year" class="k-inp mt-1" placeholder="2024" />
        </div>
        <div>
          <label class="text-sm opacity-80">Genre</label>
          <input v-model="manualForm.genre" class="k-inp mt-1" placeholder="Hip-Hop" />
        </div>
        <div>
          <label class="text-sm opacity-80">Cover URL</label>
          <input v-model="manualForm.coverUrl" class="k-inp mt-1" placeholder="https://..." />
        </div>
      </div>

      <div class="mt-4">
        <label class="text-sm opacity-80">Lyrics</label>
        <textarea
          v-model="manualForm.lyrics"
          class="k-inp mt-1 h-64 font-mono text-sm"
          placeholder="Paste lyrics here..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue'
import { api } from '../../services/api'

const emit = defineEmits(['toast', 'error'])

// Mode
const mode = ref('list')

// Song List
const songs = ref([])
const listSearch = ref('')
const filteredSongs = computed(() => {
  if (!listSearch.value.trim()) return songs.value
  const q = listSearch.value.toLowerCase()
  return songs.value.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  )
})

const selectedSong = ref(null)
const editForm = ref({})
const savingSong = ref(false)
const deletingSong = ref(false)

// Genius Search
const geniusQuery = ref('')
const geniusResults = ref([])
const geniusSearched = ref(false)
const searchingGenius = ref(false)
const importingSongId = ref(null)
const importGenre = ref('Soul')

// Album Import
const albumQuery = ref('')
const albumResults = ref([])
const albumsSearched = ref(false)
const searchingAlbums = ref(false)
const selectedAlbum = ref(null)
const importingAlbum = ref(false)
const importProgress = ref(null)

// Manual Add
const manualForm = ref(blankManual())
const savingManual = ref(false)

function blankManual() {
  return {
    title: '',
    artist: '',
    album: '',
    year: '',
    genre: 'Hip-Hop',
    lyrics: '',
    coverUrl: ''
  }
}

function resetManualForm() {
  manualForm.value = blankManual()
}

// Load all songs
async function loadAll() {
  try {
    const { data } = await api.get('/songs', { params: { limit: 500 } })
    songs.value = data.items || []
  } catch (e) {
    emit('error', 'Failed to load songs', e?.response?.data?.error || e?.message)
  }
}

function selectSong(s) {
  selectedSong.value = s
  editForm.value = { ...s }
}

async function updateSong() {
  if (!selectedSong.value) return
  savingSong.value = true

  try {
    await api.put(`/songs/${selectedSong.value._id}`, editForm.value)
    emit('toast', 'Song updated ✅')
    await loadAll()
    // Reselect
    const found = songs.value.find(s => s._id === selectedSong.value._id)
    if (found) selectSong(found)
  } catch (e) {
    emit('error', 'Update failed', e?.response?.data?.error || e?.message)
  } finally {
    savingSong.value = false
  }
}

async function deleteSong() {
  if (!selectedSong.value) return
  if (!confirm(`Delete "${selectedSong.value.title}"?`)) return

  deletingSong.value = true
  try {
    await api.delete(`/songs/${selectedSong.value._id}`)
    emit('toast', 'Song deleted 🗑️')
    selectedSong.value = null
    editForm.value = {}
    await loadAll()
  } catch (e) {
    emit('error', 'Delete failed', e?.response?.data?.error || e?.message)
  } finally {
    deletingSong.value = false
  }
}

// Genius Search
async function searchGenius() {
  if (!geniusQuery.value.trim()) return

  searchingGenius.value = true
  geniusSearched.value = false
  geniusResults.value = []

  try {
    const { data } = await api.get('/genius/search', {
      params: { q: geniusQuery.value }
    })
    geniusResults.value = data || []
    geniusSearched.value = true
  } catch (e) {
    emit('error', 'Genius search failed', e?.response?.data?.error || e?.message)
  } finally {
    searchingGenius.value = false
  }
}

async function importSong(geniusId) {
  importingSongId.value = geniusId

  try {
    await api.post('/genius/import-song', {
      geniusId,
      genre: importGenre.value || 'Hip-Hop'
    })
    emit('toast', 'Song imported ✅')
    await loadAll()
  } catch (e) {
    if (e?.response?.status === 409) {
      emit('toast', 'Song already exists')
    } else {
      emit('error', 'Import failed', e?.response?.data?.error || e?.message)
    }
  } finally {
    importingSongId.value = null
  }
}

// Album Search & Import
async function searchAlbums() {
  if (!albumQuery.value.trim()) return

  searchingAlbums.value = true
  albumsSearched.value = false
  albumResults.value = []
  selectedAlbum.value = null
  importProgress.value = null

  try {
    const { data } = await api.get('/genius/albums/search', {
      params: { q: albumQuery.value }
    })
    albumResults.value = data || []
    albumsSearched.value = true
  } catch (e) {
    emit('error', 'Album search failed', e?.response?.data?.error || e?.message)
  } finally {
    searchingAlbums.value = false
  }
}

async function loadAlbum(albumId) {
  try {
    const { data } = await api.get(`/genius/album/${albumId}`)
    selectedAlbum.value = data
    importProgress.value = null
  } catch (e) {
    emit('error', 'Failed to load album', e?.response?.data?.error || e?.message)
  }
}

async function importAlbum() {
  if (!selectedAlbum.value) return

  importingAlbum.value = true
  importProgress.value = null

  try {
    const body = {
      albumId: selectedAlbum.value.id,
      genre: importGenre.value || 'Hip-Hop',
    }

    const { data } = await api.post('/genius/import-album', body, {
      timeout: 10 * 60 * 1000, // 10 minutes
    })

    importProgress.value = data
    emit('toast', `Album imported! ${data.imported} songs added.`)
    await loadAll()
  } catch (e) {
    emit('error', 'Album import failed', e?.response?.data?.error || e?.message)
  } finally {
    importingAlbum.value = false
  }
}


// Manual Add
async function saveManual() {
  if (!manualForm.value.title.trim() || !manualForm.value.artist.trim()) {
    emit('error', 'Title and artist are required')
    return
  }

  savingManual.value = true

  try {
    await api.post('/songs', manualForm.value)
    emit('toast', 'Song added ✅')
    resetManualForm()
    await loadAll()
  } catch (e) {
    if (e?.response?.status === 409) {
      emit('toast', 'Song already exists')
    } else {
      emit('error', 'Save failed', e?.response?.data?.error || e?.message)
    }
  } finally {
    savingManual.value = false
  }
}

function filterSongs() {
  // Computed handles this
}

defineExpose({ loadAll })

onMounted(loadAll)
</script>
