<template>
  <header class="sticky top-0 z-50 backdrop-blur border-b border-white/10 bg-black/30">
	<div
  v-if="showContact"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
  @click.self="showContact=false"
>
  <div class="k-card p-6 max-w-sm text-center">
    <h3 class="text-lg font-semibold accent mb-2">Contact Me</h3>
    <p class="opacity-80 text-sm mb-4">Let’s connect</p>

    <a
      href="mailto:kecole2@cougarnet.uh.edu"
      class="k-btn accent-bg text-black font-medium"
    >
      Send Email
    </a>
  </div>
</div>

    <nav class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <img :src="logo" alt="KyriqLab" class="h-9 w-9 rounded-lg" />
        <span class="font-semibold tracking-wide">KyriqLab</span>
      </RouterLink>

      <!-- Desktop -->
      <div class="hidden md:flex items-center gap-6">
        <RouterLink class="navlink" to="/">Home</RouterLink>
        <RouterLink class="navlink" to="/lyric-blitz">Lyric Blitz</RouterLink>
        <RouterLink class="navlink" to="/song-library">Song Library</RouterLink>
        <RouterLink class="navlink" to="/notepad">Notepad</RouterLink>
        <RouterLink class="navlink" to="/empathy-eq">Empathy EQ</RouterLink>
      </div>

      <div class="hidden md:flex items-center gap-3">
        <RouterLink class="k-btn" :to="loggedIn ? '/admin' : '/login'">
          {{ loggedIn ? 'Admin' : 'Login' }}
        </RouterLink>

        <button v-if="loggedIn" class="k-btn2" @click="logout">Logout</button>

	<button class="k-btn k-accent-bg text-black" @click="openContact">
  Contact
</button>

      </div>

      <!-- Mobile -->
      <button class="md:hidden k-btn" @click="open = !open" aria-label="Menu">
        ☰
      </button>
    </nav>

    <!-- Mobile dropdown -->
    <div v-if="open" class="md:hidden border-t border-white/10 bg-black/60">
      <div class="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
        <RouterLink class="navlink" @click="open=false" to="/">Home</RouterLink>
        <RouterLink class="navlink" @click="open=false" to="/lyric-blitz">Lyric Blitz</RouterLink>
        <RouterLink class="navlink" @click="open=false" to="/song-library">Song Library</RouterLink>
        <RouterLink class="navlink" @click="open=false" to="/notepad">Notepad</RouterLink>
        <RouterLink class="navlink" @click="open=false" to="/empathy-eq">Empathy EQ</RouterLink>

        <div class="flex items-center gap-3 pt-2">
          <RouterLink class="k-btn" @click="open=false" :to="loggedIn ? '/admin' : '/login'">
            {{ loggedIn ? 'Admin' : 'Login' }}
          </RouterLink>
          <button v-if="loggedIn" class="k-btn2" @click="logoutAndClose">Logout</button>
	  <button class="k-btn k-accent-bg text-black" @click="() => { open=false; openContact() }">
  Contact
</button>

        </div>
      </div>
    </div>
  </header>
  <div v-if="showContact" class="fixed inset-0 z-50">
  <!-- backdrop -->
  <div class="absolute inset-0 bg-black/70" @click="showContact=false"></div>

  <!-- modal -->
  <div class="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2">
    <div class="k-card p-6 shadow-2xl">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-xl font-bold">
            Contact <span class="k-accent">Kyriq</span>
          </h3>
          <p class="mt-2 text-sm opacity-80">
            Email me and I’ll get back to you.
          </p>
        </div>

        <button class="k-btn2" @click="showContact=false">✕</button>
      </div>

      <div class="mt-4 rounded-xl bg-white/5 p-4">
        <div class="text-xs uppercase opacity-60">Email</div>
        <div class="mt-1 font-mono text-sm">
          kecole2@cougarnet.uh.edu
        </div>
      </div>

      <div class="mt-5 flex gap-3">
        <a
          href="mailto:kecole2@cougarnet.uh.edu"
          class="flex-1 text-center px-4 py-2 rounded-xl k-accent-bg text-black font-semibold"
        >
          Open Email
        </a>
        <button class="k-btn2" @click="showContact=false">Close</button>
      </div>
    </div>
  </div>
</div>

</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import logo from '../assets/logo.png'
import { isLoggedIn, clearAdminKey } from '../services/auth'


import { nextTick } from 'vue'


function openContact() {
  showContact.value = true

  nextTick(() => {
    const footer = document.getElementById('contact-footer')
    footer?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const btn = document.getElementById('mailto-btn')
    if (btn) {
      btn.classList.add('accent-ring')
      setTimeout(() => btn.classList.remove('accent-ring'), 1500)
    }
  })
}



const router = useRouter()
const loggedIn = computed(() => isLoggedIn())
const open = ref(false)



function logout() {
  clearAdminKey()
  router.push('/login')
}

function logoutAndClose() {
  open.value = false
  logout()
}

function contactAndClose() {
  open.value = false
  scrollToContact()
}

const showContact = ref(false)

function scrollToContact() {
  showContact.value = true
  setTimeout(() => {
    document
      .getElementById('contact-footer')
      ?.scrollIntoView({ behavior: 'smooth' })
  }, 300)
}

</script>

<style scoped>
.navlink { opacity: 0.88; }
.navlink:hover { opacity: 1; }
</style>
