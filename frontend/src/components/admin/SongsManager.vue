<template>
  <div class="space-y-6">
    <div class="flex flex-wrap gap-3">
      <button class="k-btn" :class="mode === 'list' ? 'opacity-100' : 'opacity-60'" @click="mode = 'list'">📋 Song List</button>
      <button class="k-btn" :class="mode === 'search' ? 'opacity-100' : 'opacity-60'" @click="mode = 'search'">🔍 Search Genius</button>
      <button class="k-btn" :class="mode === 'album' ? 'opacity-100' : 'opacity-60'" @click="mode = 'album'">💿 Import Album</button>
      <button class="k-btn" :class="mode === 'manual' ? 'opacity-100' : 'opacity-60'" @click="mode = 'manual'">✏️ Add Manual</button>
    </div>


<div v-if="mode === 'list'" class="grid lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
      <div class="lg:col-span-1 h-full overflow-hidden">
        <SongList
          :songs="songs"
          :selectedId="selectedSong?._id"
          @select="selectSong"
          class="h-full"
        />
      </div>
      <div class="lg:col-span-2 h-full overflow-hidden">
        <SongEditor
          :song="selectedSong"
          @refresh="handleRefresh"
          @toast="relayToast"
          @error="relayError"
          class="h-full"
        />
      </div>
    </div>

    <div v-if="mode === 'search'">
      <GeniusSearch @refresh="loadAll" @toast="relayToast" @error="relayError" />
    </div>

    <div v-if="mode === 'album'">
      <AlbumImport @refresh="loadAll" @toast="relayToast" @error="relayError" />
    </div>

    <div v-if="mode === 'manual'">
      <ManualAdd @refresh="loadAll" @toast="relayToast" @error="relayError" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../services/api'

// Sub-components
import SongList from './songs/SongList.vue'
import SongEditor from './songs/SongEditor.vue'
import GeniusSearch from './songs/GeniusSearch.vue'
import AlbumImport from './songs/AlbumImport.vue'
import ManualAdd from './songs/ManualAdd.vue'

const emit = defineEmits(['toast', 'error'])

const mode = ref('list')
const songs = ref([])
const selectedSong = ref(null)

// --- Actions ---

async function loadAll() {
  try {
    const { data } = await api.get('/songs', { params: { limit: 3000 } })
    songs.value = data.items || []
  } catch (e) {
    relayError('Failed to load songs', e?.message)
  }
}

function selectSong(song) {
  selectedSong.value = song
}

function handleRefresh() {
  loadAll()
  selectedSong.value = null // Deselect after delete/update to be safe
}

// Helpers to pass events up to Admin.vue
function relayToast(msg) { emit('toast', msg) }
function relayError(msg, detail) { emit('error', msg, detail) }

onMounted(loadAll)
defineExpose({ loadAll })
</script>
