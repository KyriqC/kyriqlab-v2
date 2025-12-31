<template>
  <div class="k-card p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="font-semibold">✏️ Add Song Manually</div>
      <button class="k-btn" :disabled="saving" @click="save">
        {{ saving ? 'Saving...' : 'Save Song' }}
      </button>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="text-sm opacity-80">Title *</label>
        <input v-model="form.title" class="k-inp mt-1" placeholder="Title" />
      </div>
      <div>
        <label class="text-sm opacity-80">Artist *</label>
        <input v-model="form.artist" class="k-inp mt-1" placeholder="Artist" />
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
      <div>
        <label class="text-sm opacity-80">Cover URL</label>
        <input v-model="form.coverUrl" class="k-inp mt-1" />
      </div>
    </div>

    <div class="mt-4">
      <label class="text-sm opacity-80">Lyrics</label>
      <textarea
        v-model="form.lyrics"
        class="k-inp mt-1 h-64 font-mono text-sm"
        placeholder="Paste lyrics here..."
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../../../services/api'

const emit = defineEmits(['refresh', 'toast', 'error'])

const form = ref(blankForm())
const saving = ref(false)

function blankForm() {
  return { title: '', artist: '', album: '', year: '', genre: 'Hip-Hop', lyrics: '', coverUrl: '' }
}

async function save() {
  if (!form.value.title || !form.value.artist) {
    emit('error', 'Title and Artist required')
    return
  }
  saving.value = true
  try {
    await api.post('/songs', form.value)
    emit('toast', 'Song added ✅')
    emit('refresh')
    form.value = blankForm()
  } catch (e) {
    emit('error', 'Save failed', e?.response?.data?.error || e?.message)
  } finally {
    saving.value = false
  }
}
</script>
