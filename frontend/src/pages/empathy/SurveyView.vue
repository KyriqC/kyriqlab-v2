<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adultQuestions, childQuestions } from '../../data/surveyData'

const route = useRoute()
const router = useRouter()

// State (DECLARE THESE BEFORE watch)
const surveyType = ref('adult')
const currentQuestionIndex = ref(0)
const answers = ref({})
const isFinished = ref(false)

// Keep state in sync with route
watch(
  () => route.params.type,
  (newType) => {
    if (newType !== 'adult' && newType !== 'child') {
      router.replace('/empathy')
      return
    }
    surveyType.value = newType
    currentQuestionIndex.value = 0
    answers.value = {}
    isFinished.value = false
    window.scrollTo(0, 0)
  },
  { immediate: true }
)

const questions = computed(() => (surveyType.value === 'adult' ? adultQuestions : childQuestions))
const hasQuestions = computed(() => Array.isArray(questions.value) && questions.value.length > 0)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const progress = computed(() => {
  if (!hasQuestions.value) return 0
  return (currentQuestionIndex.value / questions.value.length) * 100
})

const totalScore = computed(() => Object.values(answers.value).reduce((a, b) => a + b, 0))

const resultData = computed(() => {
  const score = totalScore.value

  if (surveyType.value === 'adult') {
    if (score <= 32) return { level: 'Low', range: '0–32', message: 'This score suggests you may have difficulty recognising or responding to others’ emotions.', statNote: 'Most people with Asperger Syndrome or high-functioning autism score about 20.' }
    if (score <= 52) return { level: 'Average', range: '33–52', message: 'You have a typical level of empathy, relating to others in a balanced way.', statNote: 'Most women score about 47 and most men score about 42.' }
    if (score <= 63) return { level: 'Above Average', range: '53–63', message: 'You are slightly more empathetic than the average person, likely very attuned to social cues.', statNote: 'This range indicates a stronger-than-average ability to empathize.' }
    return { level: 'Very High', range: '64–80', message: 'You are highly empathetic. This is a strength, though it can lead to emotional fatigue if not balanced.', statNote: 'Scores of 80 are considered maximum.' }
  } else {
    if (score <= 24) return { level: 'Low', range: '0–24', message: 'This score may suggest challenges in understanding and responding to emotions.', statNote: 'Most children with Asperger Syndrome or high-functioning autism score about 14.' }
    if (score <= 44) return { level: 'Average', range: '25–44', message: 'Your child demonstrates an average range of empathy development for their age group.', statNote: 'Most girls score about 40 and most boys score about 34.' }
    if (score <= 49) return { level: 'Above Average', range: '45–49', message: 'Your child appears to have strong empathetic understanding and concern for others.', statNote: 'This indicates a developing strength in social connection.' }
    return { level: 'Very High', range: '50–54', message: 'Your child has exceptionally high empathy, which can be a great strength socially and emotionally.', statNote: '54 is the maximum possible score.' }
  }
})

function handleAnswer(optionValue) {
  if (!currentQuestion.value) return

  let points = 0
  if (currentQuestion.value.type === 'positive') {
    if (optionValue === 'strongly-agree') points = 2
    else if (optionValue === 'slightly-agree') points = 1
  } else {
    if (optionValue === 'strongly-disagree') points = 2
    else if (optionValue === 'slightly-disagree') points = 1
  }

  answers.value[currentQuestionIndex.value] = points

  if (currentQuestionIndex.value < questions.value.length - 1) currentQuestionIndex.value++
  else {
    isFinished.value = true
    window.scrollTo(0, 0)
  }
}
</script>



<template>
  <div class="min-h-screen bg-dark-bg py-20 px-4">
    <div class="max-w-2xl mx-auto">

      <router-link to="/empathy" class="text-gray-500 hover:text-white mb-8 inline-block font-bold">
        &larr; Exit Survey
      </router-link>

      <!-- NOT finished yet -->
      <div v-if="!isFinished">
        <div v-if="!hasQuestions" class="text-white">
          Could not load questions for this survey type.
        </div>

        <div v-else>
          <div class="mb-8">
            <h2 class="text-celtics-green font-bold uppercase tracking-wider text-sm mb-2">
              Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}
            </h2>
            <div class="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-celtics-green transition-all duration-300 ease-out"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>

          <div class="bg-card-bg p-8 md:p-12 rounded-2xl border border-gray-800 shadow-xl min-h-[300px] flex flex-col justify-center">
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-10 text-center leading-snug">
              {{ currentQuestion?.text }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button @click="handleAnswer('strongly-agree')" class="p-4 rounded-xl border border-green-900 bg-[#0a2010] text-green-400 font-bold hover:bg-celtics-green hover:text-white transition-all">
                Strongly Agree
              </button>
              <button @click="handleAnswer('slightly-agree')" class="p-4 rounded-xl border border-gray-700 bg-dark-bg text-gray-300 font-bold hover:bg-gray-600 hover:text-white transition-all">
                Slightly Agree
              </button>
              <button @click="handleAnswer('slightly-disagree')" class="p-4 rounded-xl border border-gray-700 bg-dark-bg text-gray-300 font-bold hover:bg-gray-600 hover:text-white transition-all">
                Slightly Disagree
              </button>
              <button @click="handleAnswer('strongly-disagree')" class="p-4 rounded-xl border border-red-900 bg-[#2a0a0a] text-red-400 font-bold hover:bg-red-600 hover:text-white transition-all">
                Strongly Disagree
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Finished -->
      <div v-else class="text-center animate-fade-in-up">
	<h2 class="text-4xl font-black text-white mb-2">Results</h2>
        <p class="text-gray-500 mb-8">Based on the Baron-Cohen scale</p>

        <div class="bg-card-bg rounded-3xl border border-gray-800 shadow-2xl mb-8 overflow-hidden">
          <div class="p-10 pb-6 border-b border-gray-800 bg-[#0f0f0f]">
            <div class="text-7xl font-black text-celtics-green mb-2">{{ totalScore }}</div>
            <div class="text-xl text-gray-400 font-bold uppercase tracking-widest">
              {{ resultData.level }} Empathy
            </div>
            <div class="text-sm text-gray-600 mt-2 font-mono">Range: {{ resultData.range }}</div>
          </div>

          <div class="p-8 text-left space-y-6">
            <div>
              <h4 class="text-white font-bold text-lg mb-2">What this means</h4>
              <p class="text-gray-400 leading-relaxed">
                {{ resultData.message }}
              </p>
            </div>

            <div class="bg-dark-bg p-4 rounded-xl border border-gray-800">
              <h4 class="text-celtics-green font-bold text-sm uppercase tracking-wide mb-1">
                Statistical Context
              </h4>
              <p class="text-gray-300 text-sm italic">
                "{{ resultData.statNote }}"
              </p>
            </div>
          </div>
        </div>

        <div class="bg-blue-900/20 border border-blue-900 p-6 rounded-xl text-left mb-8">
          <h4 class="text-blue-400 font-bold mb-2 text-sm uppercase">Important Note</h4>
          <p class="text-blue-200 text-sm leading-relaxed">
            This tool is for educational purposes only. It is not a clinical diagnosis.
            Scores are interpretive based on general population statistics found in <em>The Science of Evil</em>.
          </p>
        </div>

        <div class="flex justify-center gap-4">
          <button @click="router.go(0)" class="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">
            Retake
          </button>
          <router-link to="/empathy" class="px-8 py-3 bg-celtics-green text-white font-bold rounded-lg hover:bg-[#00632a] transition-colors">
            Back to Menu
          </router-link>
        </div>
      </div>

      </div>

    </div>
 
</template>
