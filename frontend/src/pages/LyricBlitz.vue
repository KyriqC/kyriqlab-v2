<template>
  <div class="min-h-screen">
    <section class="max-w-4xl mx-auto px-4 py-10 text-center">
      <div v-if="loadingInit" class="py-20">
        <div class="text-xl opacity-70 animate-pulse">
          {{ initError || 'Loading Song Database...' }}
        </div>
      </div>

      <div v-else-if="!isPlaying && !isGameOver" class="space-y-8">
        <div>
          <h1 class="text-5xl md:text-6xl font-black text-[#00A651] mb-4">
            Lyric Blitz
          </h1>
          <p class="text-xl opacity-70">
            Guess the <span class="font-bold text-white">Song Title</span> from the lyrics.
          </p>
        </div>

        <div class="max-w-2xl mx-auto k-card p-8 space-y-6">
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="text-left">
              <label class="block text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Artist</label>
              <input 
                v-model="selectedArtist" 
                list="artistList" 
                placeholder="All Artists"
                class="w-full p-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-[#00A651] transition"
              />
              <datalist id="artistList">
                <option value="All">All Artists</option>
                <option v-for="a in artists" :key="a" :value="a"></option>
              </datalist>
            </div>

            <div class="text-left">
              <label class="block text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Album</label>
              <input 
                v-model="selectedAlbum" 
                list="albumList" 
                placeholder="All Albums"
                class="w-full p-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-[#00A651] transition"
              />
              <datalist id="albumList">
                <option value="All">All Albums</option>
                <option v-for="al in albums" :key="al" :value="al"></option>
              </datalist>
            </div>

            <div class="text-left">
              <label class="block text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Year</label>
              <select 
                v-model="selectedYear"
                class="w-full p-3 rounded-xl border border-white/10 bg-white/5 outline-none focus:border-[#00A651] transition"
              >
                <option value="All">All Years</option>
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <div class="text-left">
              <label class="block text-xs font-bold opacity-60 uppercase tracking-wider mb-2">Time Limit</label>
              <div class="flex gap-2">
                <button
                  v-for="time in [60, 90, 120]"
                  :key="time"
                  @click="selectedTime = time"
                  class="flex-1 py-3 font-bold rounded-xl border transition"
                  :class="selectedTime === time ? 'border-[#00A651]/50 bg-[#00A651]/20 text-[#00A651]' : 'border-white/10 bg-white/5 hover:border-white/20'"
                >
                  {{ time }}s
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="startGame"
          class="k-btn text-xl px-12 py-4"
          :disabled="songCount === 0"
        >
          Start Game
        </button>

        <div class="text-sm opacity-50">
          {{ songCount }} active songs available
        </div>
      </div>

      <div v-else-if="isPlaying" class="space-y-8 max-w-2xl mx-auto">
        <div class="flex justify-between items-end border-b border-white/10 pb-4">
          <div class="text-left">
            <div class="text-[#00A651] text-4xl font-black">
              {{ score }} <span class="text-lg text-white font-medium">pts</span>
            </div>
            <div class="text-xs uppercase tracking-wider font-bold" :class="gameStatus.class">
              {{ gameStatus.text }}
            </div>
          </div>
          <div class="text-3xl font-mono font-bold" :class="timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'">
            {{ timeLeft }}s
          </div>
        </div>

        <div class="k-card p-10 min-h-[250px] flex flex-col justify-center items-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1 h-full bg-[#00A651]"></div>
          <p class="text-xs font-bold uppercase tracking-widest mb-6 opacity-60">
            Artist: {{ currentSong?.artist }}
          </p>
          <h2 class="text-2xl md:text-3xl font-serif italic leading-relaxed whitespace-pre-line">
            "{{ currentSnippet }}"
          </h2>
        </div>

        <div class="space-y-4">
          <input
            ref="guessInput"
            v-model="userGuess"
            @keyup.enter="checkAnswer"
            type="text"
            placeholder="Type Song Title..."
            class="w-full px-6 py-4 text-xl rounded-xl border-2 border-white/10 bg-white/5 focus:border-[#00A651] focus:shadow-[0_0_15px_rgba(0,166,81,0.2)] text-center transition outline-none"
          />

          <div class="flex gap-3">
            <button @click="checkAnswer" class="flex-[2] py-4 k-btn text-lg">Submit</button>
            <button @click="useHint" :disabled="hasUsedHint" class="flex-1 py-4 font-bold rounded-xl border border-yellow-600/50 text-yellow-500 hover:bg-yellow-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {{ hasUsedHint ? 'Used' : 'Hint' }}
            </button>
            <button @click="skipSong" class="flex-1 py-4 k-btn2">Skip</button>
          </div>

          <div class="h-8 font-bold text-lg" :class="feedbackColor">{{ feedbackMessage }}</div>
        </div>
      </div>

      <div v-else class="max-w-xl mx-auto py-10">
        <h2 class="text-5xl font-black mb-2">Game Over!</h2>
        <div class="bg-gradient-to-br from-[#00A651] to-[#004d20] text-white rounded-3xl p-10 my-8 shadow-2xl">
          <div class="text-sm font-medium uppercase tracking-widest opacity-90 mb-2">Final Score</div>
          <div class="text-8xl font-black leading-none">{{ score }}</div>
        </div>

        <div v-if="gameHistory.length > 0" class="k-card p-6 mb-8 text-left max-h-60 overflow-y-auto">
          <h3 class="text-sm font-bold uppercase mb-4 border-b border-white/10 pb-2 opacity-60">Round Recap</h3>
          <div v-for="(round, idx) in gameHistory" :key="idx" class="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
            <span class="font-medium">{{ round.title }}</span>
            <span :class="round.class">{{ round.status }}</span>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="resetGame" class="flex-1 py-4 k-btn text-lg">Play Again</button>
          <RouterLink to="/song-library" class="flex-1 py-4 k-btn2 text-lg text-center">Library</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../services/api'

// Data
const loadingInit = ref(true)
const initError = ref('')
const artists = ref([])
const albums = ref([])
const years = ref([])
const songCount = ref(0)

// Game State
const gameQueue = ref([])
const isPlaying = ref(false)
const isGameOver = ref(false)
const score = ref(0)
const timeLeft = ref(60)
const selectedTime = ref(60)

// Selection State
const selectedArtist = ref('')
const selectedAlbum = ref('')
const selectedYear = ref('All')

// Round State
const currentSongIndex = ref(0)
const userGuess = ref('')
const feedbackMessage = ref('')
const feedbackColor = ref('')
const currentSnippet = ref('')
const gameHistory = ref([])
const hasUsedHint = ref(false)
const guessInput = ref(null)
let timerInterval = null

// Computed
const currentSong = computed(() => gameQueue.value[currentSongIndex.value] || null)

const gameStatus = computed(() => {
  if (score.value >= 100) return { text: 'LEGENDARY!', class: 'text-purple-500 animate-pulse' }
  if (score.value >= 50) return { text: 'On Fire!', class: 'text-orange-500' }
  if (score.value > 0) return { text: 'Heating Up...', class: 'text-blue-500' }
  return { text: 'Warming Up', class: 'opacity-50' }
})

watch(currentSong, (song) => {
  if (!song) return
  currentSnippet.value = generateSnippet(song.lyrics, 3)
})

// Logic
function generateSnippet(fullLyrics, lineCount = 3) {
  if (!fullLyrics || typeof fullLyrics !== 'string') return 'Lyrics not found'
  const lines = fullLyrics.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('['))
  if (lines.length === 0) return 'Lyrics not found'
  if (lines.length <= lineCount) return lines.join('\n')
  const startIndex = Math.floor(Math.random() * (lines.length - lineCount))
  return lines.slice(startIndex, startIndex + lineCount).join('\n')
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else endGame()
  }, 1000)
}

async function startGame() {
  feedbackMessage.value = ''
  feedbackColor.value = ''

  try {
    const params = { count: 50 }
    
    // Handle "All" or Empty selections
    if (selectedArtist.value && selectedArtist.value !== 'All') params.artist = selectedArtist.value
    if (selectedAlbum.value && selectedAlbum.value !== 'All') params.album = selectedAlbum.value
    if (selectedYear.value && selectedYear.value !== 'All') params.year = selectedYear.value

    const { data } = await api.get('/songs/random', { params })

    if (!data || data.length === 0) {
      feedbackMessage.value = 'No songs found with those filters!'
      feedbackColor.value = 'text-red-500'
      return
    }

    gameQueue.value = data
    score.value = 0
    timeLeft.value = selectedTime.value
    currentSongIndex.value = 0
    isGameOver.value = false
    isPlaying.value = true
    gameHistory.value = []
    userGuess.value = ''
    hasUsedHint.value = false

    if (currentSong.value) currentSnippet.value = generateSnippet(currentSong.value.lyrics, 3)
    
    resetTimer()
    await nextTick()
    guessInput.value?.focus()

  } catch (e) {
    feedbackMessage.value = 'Failed to load songs'
    feedbackColor.value = 'text-red-500'
  }
}

function resetGame() {
  isPlaying.value = false
  isGameOver.value = false
  feedbackMessage.value = ''
}

function useHint() {
  if (hasUsedHint.value || !currentSong.value) return
  hasUsedHint.value = true
  currentSnippet.value = generateSnippet(currentSong.value.lyrics, 6)
  feedbackMessage.value = 'Hint used! (Max 5 pts)'
  feedbackColor.value = 'text-yellow-500'
}

function checkAnswer() {
  if (!currentSong.value || !userGuess.value.trim()) return
  const normalize = (str) => str.replace(/[^a-z0-9\s]/gi, '').toLowerCase().trim()
  
  if (normalize(userGuess.value) === normalize(currentSong.value.title)) {
    const points = hasUsedHint.value ? 5 : 10
    score.value += points
    feedbackMessage.value = `Correct! +${points} Points`
    feedbackColor.value = 'text-[#00A651]'
    gameHistory.value.push({ title: currentSong.value.title, status: hasUsedHint.value ? 'Correct (Hint)' : 'Correct', class: 'text-[#00A651] font-bold' })
    nextSong()
  } else {
    feedbackMessage.value = 'Nope, try again!'
    feedbackColor.value = 'text-red-500'
  }
}

function skipSong() {
  if (!currentSong.value) return
  feedbackMessage.value = `Skipped! It was "${currentSong.value.title}"`
  feedbackColor.value = 'opacity-50'
  gameHistory.value.push({ title: currentSong.value.title, status: 'Skipped', class: 'opacity-50 italic' })
  nextSong()
}

async function nextSong() {
  userGuess.value = ''
  hasUsedHint.value = false
  if (currentSongIndex.value < gameQueue.value.length - 1) {
    currentSongIndex.value++
    if (currentSong.value) currentSnippet.value = generateSnippet(currentSong.value.lyrics, 3)
    await nextTick()
    guessInput.value?.focus()
  } else {
    endGame()
  }
}

function endGame() {
  if (timerInterval) clearInterval(timerInterval)
  isPlaying.value = false
  isGameOver.value = true
}

onMounted(async () => {
  try {
    const [artistsRes, albumsRes, yearsRes, countRes] = await Promise.all([
      api.get('/songs/artists'),
      api.get('/songs/albums'),
      api.get('/songs/years'),
      api.get('/songs', { params: { limit: 1 } })
    ])
    artists.value = artistsRes.data || []
    albums.value = albumsRes.data || []
    years.value = yearsRes.data || []
    songCount.value = countRes.data?.total || 0
  } catch (e) {
    console.error(e)
    initError.value = 'Failed to connect'
  } finally {
    loadingInit.value = false
  }
})

onUnmounted(() => clearInterval(timerInterval))
</script>
