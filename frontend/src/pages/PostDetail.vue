<template>
  <section class="max-w-3xl mx-auto px-4 py-10">
    <div v-if="error" class="k-card p-4">
      <div class="font-semibold">Error</div>
      <div class="opacity-80 text-sm mt-1">{{ error }}</div>
    </div>

    <article v-else-if="post" class="k-card p-6">
      <div class="opacity-60 text-xs">
        {{ displayDate }}
      </div>

      <h1 class="text-3xl font-semibold mt-2">{{ post.title }}</h1>

      <p v-if="post.summary" class="opacity-80 mt-3">{{ post.summary }}</p>

      <!-- Featured image -->
      <div v-if="post.featuredImageUrl" class="mt-6">
        <img
          :src="post.featuredImageUrl"
          :alt="post.title + ' featured image'"
          class="w-full max-h-[420px] object-cover rounded-xl border border-white/10 bg-white/5"
          loading="lazy"
        />
      </div>

      <!-- Gallery -->
      <div v-if="gallery.length" class="mt-5">
        <div class="text-sm opacity-80 mb-2">Photos</div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="(src, i) in gallery"
            :key="src + i"
            type="button"
            class="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/25 transition"
            @click="openLightbox(i)"
          >
            <img
              :src="src"
              class="w-full h-32 md:h-36 object-cover"
              :alt="post.title + ' photo ' + (i + 1)"
              loading="lazy"
            />
          </button>
        </div>
      </div>

      <hr class="my-6 border-white/10" />

      <div class="prose prose-invert max-w-none" v-html="html"></div>
    </article>

    <!-- Lightbox -->
    <div
      v-if="lightboxOpen"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      @click.self="closeLightbox"
    >
      <div class="max-w-5xl w-full">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm opacity-80">
            {{ lightboxIndex + 1 }} / {{ gallery.length }}
          </div>
          <button class="k-btn2" @click="closeLightbox">Close</button>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
          <img
            :src="gallery[lightboxIndex]"
            class="w-full max-h-[80vh] object-contain"
            :alt="post?.title + ' photo'"
          />
        </div>

        <div class="flex justify-between mt-3">
          <button class="k-btn2" :disabled="lightboxIndex === 0" @click="prevImg">Prev</button>
          <button class="k-btn2" :disabled="lightboxIndex >= gallery.length - 1" @click="nextImg">Next</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { fetchPostBySlug } from '../services/content'

const route = useRoute()
const post = ref(null)
const error = ref('')

const html = computed(() => {
  const raw = post.value?.content || ''
  return DOMPurify.sanitize(marked.parse(raw))
})

const displayDate = computed(() => {
  const p = post.value
  if (!p) return ''
  const d = p.publishedAt || p.createdAt
  return d ? new Date(d).toLocaleString() : ''
})

const gallery = computed(() => {
  const arr = post.value?.galleryImages
  return Array.isArray(arr) ? arr.filter(Boolean) : []
})

// simple lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(i) {
  lightboxIndex.value = i
  lightboxOpen.value = true
}
function closeLightbox() {
  lightboxOpen.value = false
}
function prevImg() {
  lightboxIndex.value = Math.max(0, lightboxIndex.value - 1)
}
function nextImg() {
  lightboxIndex.value = Math.min(gallery.value.length - 1, lightboxIndex.value + 1)
}

onMounted(async () => {
  try {
    post.value = await fetchPostBySlug(route.params.slug)
  } catch (e) {
    error.value = e?.response?.data?.error || e?.message || 'Failed to load post'
  }
})
</script>
