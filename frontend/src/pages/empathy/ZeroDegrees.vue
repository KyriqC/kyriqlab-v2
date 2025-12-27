<script setup>
import { ref } from 'vue'

// Data extracted from views/pages/zero.ejs
const disorders = ref([
  {
    title: "Borderline Personality Disorder (BPD)",
    description: "Individuals with BPD may struggle with self-image and managing emotions, leading to intense relationships and impulsivity.",
    traits: [
      "Unstable and intense interpersonal relationships",
      "Impulsive behaviors (spending, sex, substance use)",
      "Rapid, extreme mood swings",
      "Frequent anger outbursts and difficulty controlling it",
      "Self-harm or threats as emotional expressions",
      "Chronic feelings of emptiness",
      "Fear of abandonment"
    ],
    color: "text-pink-500",
    borderColor: "border-pink-900",
    bgColor: "bg-pink-900/10"
  },
  {
    title: "Antisocial Personality Disorder (ASPD)",
    description: "Sometimes referred to as sociopathy, this involves a long-term pattern of manipulating, exploiting, or violating the rights of others.",
    traits: [
      "Persistent disregard for societal rules and laws",
      "Lying and manipulation for personal gain",
      "Physical aggression or violence",
      "Lack of remorse after hurting others",
      "Neglect of obligations (e.g., financial, legal)"
    ],
    color: "text-yellow-500",
    borderColor: "border-yellow-900",
    bgColor: "bg-yellow-900/10"
  },
  {
    title: "Conduct Disorder (in Youth)",
    description: "A serious behavioral and emotional disorder that can occur in children and teens, often a precursor to ASPD.",
    traits: [
      "Bullying, intimidation, or physical cruelty",
      "Use of weapons or violent behavior",
      "Vandalism or property destruction",
      "Frequent deceit or theft",
      "Running away, staying out late, defiance of authority"
    ],
    color: "text-orange-500",
    borderColor: "border-orange-900",
    bgColor: "bg-orange-900/10"
  },
  {
    title: "Narcissistic Personality Traits",
    description: "Characterized by an inflated sense of self-importance and a deep need for excessive attention and admiration.",
    traits: [
      "Inflated sense of self-importance",
      "Preoccupation with fantasies of power or beauty",
      "Need for excessive admiration",
      "Exploitation of others",
      "Lack of empathy",
      "Envy and entitlement",
      "Arrogant or haughty behavior"
    ],
    color: "text-purple-500",
    borderColor: "border-purple-900",
    bgColor: "bg-purple-900/10"
  }
])

const activeIndex = ref(null)

const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<template>
  <div class="min-h-screen bg-dark-bg py-20 px-4">
    <div class="max-w-3xl mx-auto">
      
      <div class="mb-12 text-center">
        <router-link to="/empathy" class="text-gray-500 hover:text-white mb-6 inline-block font-bold">
          &larr; Back to Menu
        </router-link>
        <h1 class="text-4xl md:text-5xl font-black text-red-500 uppercase tracking-tight mb-4">
          Zero Degrees
        </h1>
        <p class="text-lg text-gray-400">
          Characteristics commonly associated with extremely low empathy, drawn from psychological diagnostic criteria and discussed in Simon Baron-Cohen’s <em>The Science of Evil</em>.
        </p>
      </div>

      <div class="space-y-4">
        <div 
          v-for="(item, index) in disorders" 
          :key="index"
          class="rounded-2xl overflow-hidden border border-gray-800 transition-all duration-300"
          :class="activeIndex === index ? 'bg-card-bg shadow-lg scale-[1.02]' : 'bg-card-bg/50 hover:bg-card-bg'"
        >
          <button 
            @click="toggle(index)"
            class="w-full text-left p-6 flex justify-between items-center focus:outline-none"
          >
            <div>
              <h3 class="text-xl font-bold" :class="item.color">{{ item.title }}</h3>
              <p v-if="activeIndex !== index" class="text-gray-500 text-sm mt-1 truncate max-w-xs md:max-w-md">
                {{ item.description }}
              </p>
            </div>
            <span class="text-2xl text-gray-500 font-bold ml-4">
              {{ activeIndex === index ? '−' : '+' }}
            </span>
          </button>

          <div 
            v-if="activeIndex === index" 
            class="px-6 pb-6 animate-fade-in"
          >
            <p class="text-gray-300 mb-4 text-sm">{{ item.description }}</p>
            <ul class="space-y-2">
              <li 
                v-for="trait in item.traits" 
                :key="trait" 
                class="flex items-start gap-3 text-gray-300"
              >
                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                {{ trait }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-12 p-6 rounded-xl bg-gray-900 border border-gray-800 text-center">
        <p class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Disclaimer</p>
        <p class="text-gray-400 text-sm">
          This content is informational and not meant to diagnose or label. It is included to raise awareness of traits associated with extremely low empathy.
        </p>
      </div>

    </div>
  </div>
</template>