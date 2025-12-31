<template>
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 k-card p-5">
      <div class="flex items-center justify-between">
        <div class="font-semibold">Posts</div>
        <button class="k-btn" @click="newPost">New</button>
      </div>

      <div class="mt-4 space-y-2 max-h-[520px] overflow-auto">
        <button
          v-for="p in posts"
          :key="p._id"
          class="w-full text-left rounded-xl border border-white/10 hover:border-white/25 bg-white/5 px-3 py-3 transition"
          :class="selected?._id === p._id ? 'ring-2 ring-[#00A651]/60' : ''"
          @click="selectPost(p)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="font-medium truncate">{{ p.title }}</div>
            <span class="text-xs px-2 py-1 rounded-lg border border-white/10 opacity-80 flex-shrink-0">
              {{ p.status }}
            </span>
          </div>
          <div class="text-xs opacity-70 mt-1 truncate">{{ p.slug }}</div>
        </button>
      </div>
    </div>

    <div class="lg:col-span-2 k-card p-5">
      <div class="flex items-center justify-between gap-4">
        <div class="font-semibold">Editor</div>

        <div class="flex items-center gap-3">
          <button class="k-btn2" :disabled="!selected" @click="resetToSelected">Reset</button>
          <button class="k-btn" :disabled="saving" @click="save">
            {{ saving ? 'Saving…' : (selected ? 'Update' : 'Create') }}
          </button>
          <button
            class="k-btn2"
            :disabled="!selected || deleting"
            @click="remove"
          >
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>

      <div class="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm opacity-80">Title</label>
          <input v-model="form.title" class="k-inp mt-2" placeholder="Post title" />
        </div>

        <div>
          <label class="text-sm opacity-80">Slug</label>
          <input v-model="form.slug" class="k-inp mt-2" placeholder="unique-slug" />
        </div>

        <div>
          <label class="text-sm opacity-80">Status</label>
          <select v-model="form.status" class="k-inp mt-2">
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div class="flex items-center gap-3 mt-6 md:mt-0">
          <input id="featured" type="checkbox" v-model="form.featured" />
          <label for="featured" class="text-sm opacity-80">Featured</label>
        </div>
      </div>

      <div class="mt-4">
        <label class="text-sm opacity-80">Summary</label>
        <input v-model="form.summary" class="k-inp mt-2" placeholder="Short summary" />
      </div>

      <div class="mt-6 grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm opacity-80">Featured image</label>
          <input type="file" accept="image/*,.heic" class="k-inp mt-2" @change="uploadFeatured" />

          <div class="mt-3">
            <div v-if="featuredPreview || form.featuredImageUrl" class="rounded-xl border border-white/10 p-2 bg-white/5">
              <img :src="featuredPreview || form.featuredImageUrl" class="w-full max-h-56 object-cover rounded-xl" />
            </div>
            <div v-else class="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm opacity-70">
              No photo loaded
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm opacity-80">Gallery images (multiple)</label>
          <input type="file" accept="image/*,.heic" multiple class="k-inp mt-2" @change="uploadGallery" />

          <div class="mt-3">
            <div
              v-if="(form.galleryImages && form.galleryImages.length) || (galleryPreviews && galleryPreviews.length)"
              class="flex gap-3 overflow-x-auto rounded-xl border border-white/10 p-2 bg-white/5"
            >
              <div v-for="(src, i) in (galleryPreviews.length ? galleryPreviews : form.galleryImages)" :key="src + i" class="relative flex-shrink-0">
                <img :src="src" class="h-24 w-36 object-cover rounded-xl border border-white/10" />
                <button
                  v-if="!galleryPreviews.length"
                  class="absolute top-1 right-1 text-xs px-2 py-1 rounded-lg border border-white/10 bg-black/60"
                  @click="removeGalleryImage(i)"
                >×</button>
              </div>
            </div>

            <div v-else class="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm opacity-70">
              No photos loaded
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <label class="text-sm opacity-80">Content (Markdown)</label>
        <textarea v-model="form.content" class="k-inp mt-2 h-64" placeholder="# Heading"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, defineExpose } from 'vue'
import { api, uploadImage } from '../../services/api'
import heic2any from 'heic2any' // Import the converter

const emit = defineEmits(['toast', 'error'])

const featuredPreview = ref('')
const galleryPreviews = ref([])

const posts = ref([])
const selected = ref(null)
const form = ref(blank())

const saving = ref(false)
const deleting = ref(false)

function blank() {
  return {
    title: '',
    slug: '',
    summary: '',
    content: '',
    status: 'draft',
    featured: false,
    featuredImageUrl: '',
    galleryImages: []
  }
}

async function loadAll() {
  try {
    const { data } = await api.get('/posts', { params: { page: 1, limit: 50 } })
    posts.value = data.items || []
  } catch (e) {
    emit('error', 'Failed to load posts', e?.response?.data?.error || e?.message)
  }
}

function selectPost(p) {
  selected.value = p
  form.value = {
    title: p.title || '',
    slug: p.slug || '',
    summary: p.summary || '',
    content: p.content || '',
    status: p.status || 'draft',
    featured: !!p.featured,
    featuredImageUrl: p.featuredImageUrl || '',
    galleryImages: Array.isArray(p.galleryImages) ? [...p.galleryImages] : []
  }
  featuredPreview.value = ''
  galleryPreviews.value = []
  emit('toast', `Loaded "${p.title}"`)
}

function resetToSelected() {
  if (!selected.value) return
  selectPost(selected.value)
}

function newPost() {
  selected.value = null
  form.value = blank()
  featuredPreview.value = ''
  galleryPreviews.value = []
  emit('toast', 'New post')
}

async function save() {
  saving.value = true
  try {
    if (!form.value.title.trim() || !form.value.slug.trim()) {
      throw new Error('Title and slug are required.')
    }

    if (selected.value) {
      const { data } = await api.put(`/posts/${selected.value.slug}`, form.value)
      emit('toast', 'Updated ✅')
      await loadAll()
      const found = posts.value.find(x => x._id === data._id)
      if (found) selectPost(found)
    } else {
      const { data } = await api.post('/posts', form.value)
      emit('toast', 'Created ✅')
      await loadAll()
      const found = posts.value.find(x => x._id === data._id)
      if (found) selectPost(found)
    }
  } catch (e) {
    emit('error', 'Save failed', e?.response?.data?.error || e?.message)
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!selected.value) return
  if (!confirm(`Delete "${selected.value.title}"? This cannot be undone.`)) return

  deleting.value = true
  try {
    await api.delete(`/posts/${selected.value.slug}`)
    emit('toast', 'Deleted 🗑️')
    selected.value = null
    form.value = blank()
    await loadAll()
  } catch (e) {
    emit('error', 'Delete failed', e?.response?.data?.error || e?.message)
  } finally {
    deleting.value = false
  }
}

// HELPER: Convert HEIC to JPG
async function processFile(file) {
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    try {
      emit('toast', 'Converting iPhone photo...')
      const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 })
      return new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" })
    } catch (e) {
      console.error(e)
      throw new Error("Could not convert HEIC image")
    }
  }
  return file
}

async function uploadFeatured(e) {
  let file = e.target.files?.[0]
  if (!file) return

  try {
    // 1. Process (Convert if HEIC)
    file = await processFile(file)
    
    // 2. Preview
    featuredPreview.value = URL.createObjectURL(file)
    
    // 3. Upload
    const { url } = await uploadImage(file)
    form.value.featuredImageUrl = url
    emit('toast', 'Featured image uploaded ✅')
  } catch (err) {
    emit('error', 'Upload failed', err?.message)
  }
  e.target.value = ''
}

async function uploadGallery(e) {
  const rawFiles = Array.from(e.target.files || [])
  if (!rawFiles.length) return

  try {
    const processedFiles = []
    
    // 1. Process all files
    for (const f of rawFiles) {
      processedFiles.push(await processFile(f))
    }

    // 2. Update Previews
    galleryPreviews.value = processedFiles.map(f => URL.createObjectURL(f))
    emit('toast', `Uploading ${processedFiles.length} images...`)

    // 3. Upload loop
    const uploaded = []
    for (const f of processedFiles) {
      const { url } = await uploadImage(f)
      uploaded.push(url)
    }
    
    form.value.galleryImages = [...(form.value.galleryImages || []), ...uploaded]
    galleryPreviews.value = []
    emit('toast', 'Gallery upload complete ✅')

  } catch (err) {
    emit('error', 'Upload failed', err?.message)
  }
  e.target.value = ''
}

function removeGalleryImage(idx) {
  form.value.galleryImages.splice(idx, 1)
}

defineExpose({ loadAll })

onMounted(loadAll)
</script>
