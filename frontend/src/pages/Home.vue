<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="max-w-6xl mx-auto px-4 pt-16 pb-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text -->
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm mb-6">
            <span class="w-2 h-2 rounded-full bg-[#00A651] animate-pulse"></span>
            <span class="opacity-80">Live Lab Status</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-bold leading-tight">
            KYRIQ COLE
          </h1>
          <p class="text-lg md:text-xl opacity-80 mt-3">
            System Analyst & Homelab Architect
          </p>

          <p class="mt-6 text-base opacity-70 leading-relaxed max-w-lg">
            I am an aspiring Cybersecurity Analyst and CIS Senior at the University of Houston.
            I believe the best way to learn is by doing, which is why I build enterprise-grade
            solutions in my home lab. From securing servers to full-stack development, I build
            things that work.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink to="/notepad" class="k-btn">View My Work</RouterLink>
            <a
              href="https://github.com/kyriqcole"
              target="_blank"
              rel="noopener"
              class="k-btn2"
            >
              GitHub
            </a>
          </div>
        </div>

        <!-- Right: Profile Image -->
        <div class="flex justify-center lg:justify-end">
          <div class="relative">
            <div
              v-if="profileImage"
              class="w-72 h-72 md:w-80 md:h-80 rounded-2xl border border-white/10 overflow-hidden"
            >
              <img :src="profileImage" alt="Kyriq Cole" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-72 h-72 md:w-80 md:h-80 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
            >
              <span class="text-6xl opacity-30">👤</span>
            </div>
            <!-- Decorative accent -->
            <div class="absolute -bottom-3 -right-3 w-full h-full rounded-2xl border border-[#00A651]/30 -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Status Cards -->
    <section class="max-w-6xl mx-auto px-4 py-12">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="status in statusCards"
          :key="status.name"
          class="k-card p-4 flex items-center justify-between"
        >
          <span class="font-medium">{{ status.name }}</span>
          <span
            class="text-xs px-2 py-1 rounded-lg border"
            :class="status.online
              ? 'border-[#00A651]/30 text-[#00A651] bg-[#00A651]/10'
              : 'border-red-500/30 text-red-400 bg-red-500/10'"
          >
            {{ status.online ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Technical Arsenal -->
    <section class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-semibold mb-6">Technical Arsenal</h2>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="skill in skills"
          :key="skill"
          class="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm"
        >
          {{ skill }}
        </span>
      </div>
    </section>

    <!-- Featured Projects -->
    <section class="max-w-6xl mx-auto px-4 py-12">
      <h2 class="text-2xl font-semibold mb-6">Featured Projects</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="project in projects"
          :key="project.title"
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card k-card p-5 flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#00A651]/50 hover:shadow-[0_0_20px_rgba(0,166,81,0.15)]"
        >
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-semibold">{{ project.title }}</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <p class="mt-2 text-sm opacity-70 flex-1">{{ project.description }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5"
            >
              {{ tag }}
            </span>
          </div>
        </a>
      </div>
    </section>

    <!-- Featured Blog Posts -->
    <section v-if="featuredPosts.length" class="max-w-6xl mx-auto px-4 py-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold">Latest Posts</h2>
        <RouterLink to="/notepad" class="text-sm opacity-70 hover:opacity-100 transition">
          View all →
        </RouterLink>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="post in featuredPosts"
          :key="post._id"
          :to="`/posts/${post.slug}`"
          class="k-card overflow-hidden hover:translate-y-[-2px] transition block"
        >
          <div v-if="post.featuredImageUrl" class="h-40 bg-white/5">
            <img
              :src="post.featuredImageUrl"
              :alt="post.title"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-5">
            <div class="text-xs opacity-60">
              {{ formatDate(post.publishedAt || post.createdAt) }}
            </div>
            <h3 class="text-lg font-semibold mt-2">{{ post.title }}</h3>
            <p class="text-sm opacity-70 mt-2 line-clamp-2">{{ post.summary }}</p>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchPosts } from '../services/content'

// Profile image served via Nginx from /uploads directory
const profileImage = ref('/uploads/image_1e4cc7.jpg')

const statusCards = ref([
  { name: 'Portfolio Site', online: true },
  { name: 'Umami Analytics', online: true },
  { name: 'Minecraft Bedrock', online: false },
])

const skills = [
  'Python',
  'Vue.js',
  'CompTIA Security+',
  'Linux / Bash',
  'Docker',
  'Systems Analysis',
  'AWS Basics',
  'MongoDB',
  'Node.js',
  'Git',
]

const projects = [
  {
    title: 'Cloud Order Management System',
    description: 'Led a team of 8 to build a Vue.js/Node.js dashboard for a bakery, reducing order errors by 80%. Designed data flow diagrams and managed the SDLC.',
    tags: ['Vue.js', 'Systems Analysis', 'Team Lead'],
    link: 'https://github.com/kyriqcole/cloud-order-system',
  },
  {
    title: 'Empathy Survey App',
    description: 'Full-stack application measuring empathy traits with complex scoring logic and accessibility features.',
    tags: ['Node.js', 'EJS', 'MongoDB'],
    link: 'https://github.com/kyriqcole/empathy-survey',
  },
  {
    title: 'Python Automation Bot',
    description: 'Automated typing bot using Selenium that interacts with web elements at adjustable human-like speeds.',
    tags: ['Python', 'Selenium', 'Automation'],
    link: 'https://github.com/kyriqcole/automation-bot',
  },
]

const featuredPosts = ref([])

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(async () => {
  try {
    const data = await fetchPosts({ page: 1, limit: 3, status: 'published' })
    featuredPosts.value = data.items || []
  } catch (e) {
    console.error('Failed to load featured posts:', e)
  }
})
</script>

<style scoped>
.project-card {
  cursor: pointer;
}

.project-card:hover svg {
  opacity: 1;
}
</style>
