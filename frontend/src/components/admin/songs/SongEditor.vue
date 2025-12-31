<template>
  <div class="k-card h-full flex flex-col p-0 overflow-hidden">
    <div class="p-5 border-b border-white/10 bg-black/20 flex items-center justify-between gap-4">
      <div class="font-semibold truncate">{{ song ? 'Edit: ' + song.title : 'Select a song' }}</div>
      <div class="flex gap-2 shrink-0">
        <button
          class="k-btn"
          :disabled="!song || saving"
          @click="updateSong"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <button
          class="k-btn2"
          :disabled="!song || deleting"
          @click="deleteSong"
        >
          {{ deleting ? '...' : 'Delete' }}
        </button>
      </div>
    </div>

    <div v-if="song" class="p-5 overflow-y-auto flex-1">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm opacity-80">Title</label>
          <input v-model="form.title" class="k-inp mt-1" />
        </div>
        <div>
          <label class="text-sm opacity-80">Artist</label>
          <input v-model="form.artist" class="k-inp mt-1" />
        </div>
        <div>
          <label class="text-sm opacity-80">Album</label>
          <input v-model="form.album" class="k-inp mt-1" />
        </div>
        <div>
          <label class="text-sm opacity-80">Year</label>
          <input v-model="form.year" class="k-inp mt-1" />
        </div>
        <div>
          <label class="text-sm opacity-80">Genre</label>
          <input v-model="form.genre" class="k-inp mt-1" />
        </div>
        <div class="flex items-center gap-3 mt-6">
          <input id="isActive" type="checkbox" v-model="form.isActive" />
          <label for="isActive" class="text-sm opacity-80">Active (used in game)</label>
        </div>
      </div>

      <div class="mt-4">
        <label class="text-sm opacity-80">Lyrics</label>
        <textarea v-model="form.lyrics" class="k-inp mt-1 h-96 font-mono text-sm"></textarea>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center opacity-50">
      Select a song from the list to edit
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '../../../services/api'

const props = defineProps({ song: Object })
const emit = defineEmits(['refresh', 'toast', 'error'])

const form = ref({})
const saving = ref(false)
const deleting = ref(false)

// Watch for song selection and fetch full details (lyrics)
watch(() => props.song, async (newSong) => {
  if (newSong) {
    form.value = { ...newSong } // Fast UI update
    try {
      // Fetch full details (including lyrics) from API
      const { data } = await api.get(`/songs/${newSong._id}`)
      form.value = data
    } catch (e) {
      console.error("Lyrics fetch failed", e)
    }
  } else {
    form.value = {}
  }
}, { immediate: true })

async function updateSong() {
  if (!props.song) return
  saving.value = true
  try {
    await api.put(`/songs/${props.song._id}`, form.value)
    emit('toast', 'Song updated ✅')
    emit('refresh')
  } catch (e) {
    emit('error', 'Update failed', e?.response?.data?.error)
  } finally {
    saving.value = false
  }
}

async function deleteSong() {
  if (!props.song) return
  if (!confirm(`Delete "${props.song.title}"?`)) return
  deleting.value = true
  try {
    await api.delete(`/songs/${props.song._id}`)
    emit('toast', 'Song deleted 🗑️')
    emit('refresh')
  } catch (e) {
    emit('error', 'Delete failed', e?.response?.data?.error)
  } finally {
    deleting.value = false
  }
}
</script>
