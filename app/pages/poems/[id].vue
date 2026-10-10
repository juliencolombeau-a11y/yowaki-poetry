<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Poem {
  id: number
  documentOrder: number
  contentType: 'poem' | 'document'
  title: string
  body: string
  excerpt: string | null
  collection: string | null
  form: string | null
  stanza: string | null
  meter: string | null
  rhymeScheme: string | null
  isCalligram: boolean
  creationDate: string | null
  notes: string | null
  languages: string[]
  media: Array<{
    id: number
    kind: 'image' | 'pdf'
    url: string
    mimeType: string
    originalFilename: string | null
  }>
}

interface PublicFeedback {
  ratings: {
    enabled: boolean
    count: number
    pois: number[]
    ownValue: number | null
  }
  comments: {
    enabled: boolean
    data: Array<{
      id: number
      pseudonym: string
      content: string
      createdAt: string
    }>
    total: number
    pageSize: number
  }
}

const pois = [
  { label: 'rouge', color: '#C62828' },
  { label: 'orange', color: '#EF6C00' },
  { label: 'jaune', color: '#F9A825' },
  { label: 'vert', color: '#2E7D32' },
  { label: 'arc-en-ciel', color: 'rainbow' },
]

const route = useRoute()
const { data: poem, error } = await useFetch<Poem>(`/api/poems/${route.params.id}`)
const feedback = ref<PublicFeedback | null>(null)
const feedbackLoading = ref(true)
const feedbackError = ref('')
const selectedRating = ref<number | null>(null)
const hoveredRating = ref<number | null>(null)
const savingRating = ref(false)
const ratingMessage = ref('')
const pseudonym = ref('')
const commentContent = ref('')
const honeypot = ref('')
const submittingComment = ref(false)
const commentMessage = ref('')
const commentSuccess = ref(false)
const submissionReady = ref(false)
let submissionReadyTimer: ReturnType<typeof setTimeout> | undefined
const ratingDescription = computed(() => {
  if (!feedback.value) {
    return ''
  }
  const description = feedback.value.ratings.pois
    .map((fill, index) => `pois ${pois[index]?.label} ${fill >= 1 ? 'rempli' : fill > 0 ? 'partiellement rempli' : 'vide'}`)
    .join(', ')
  const voteLabel = feedback.value.ratings.count === 1 ? 'vote' : 'votes'
  return `${description}. ${feedback.value.ratings.count} ${voteLabel}.`
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Poème introuvable.',
  })
}

async function loadFeedback() {
  feedbackLoading.value = true
  feedbackError.value = ''
  try {
    feedback.value = await $fetch<PublicFeedback>(`/api/poems/${route.params.id}/feedback`)
    selectedRating.value = feedback.value.ratings.ownValue
  }
  catch {
    feedbackError.value = 'Les contributions ne peuvent pas être chargées pour le moment.'
  }
  finally {
    feedbackLoading.value = false
  }
}

async function submitRating(value: number) {
  if (!feedback.value) {
    return
  }

  const previousRating = feedback.value.ratings.ownValue
  const previousCount = feedback.value.ratings.count
  const previousAverage = feedback.value.ratings.pois.reduce((total, fill) => total + fill, 0)
  const nextCount = previousCount + (previousRating === null ? 1 : 0)
  const nextAverage = previousCount === 0
    ? value
    : (previousAverage * previousCount - (previousRating ?? 0) + value) / nextCount

  selectedRating.value = value
  feedback.value.ratings.ownValue = value
  feedback.value.ratings.count = nextCount
  feedback.value.ratings.pois = Array.from(
    { length: 5 },
    (_, index) => Math.min(1, Math.max(0, nextAverage - index)),
  )
  ratingMessage.value = ''
  savingRating.value = true
  try {
    await $fetch(`/api/poems/${route.params.id}/rating`, {
      method: 'POST',
      body: { value, website: '' },
    })
    ratingMessage.value = 'Votre vote a bien été enregistré.'
  }
  catch (error: unknown) {
    feedback.value.ratings.ownValue = previousRating
    feedback.value.ratings.count = previousCount
    feedback.value.ratings.pois = Array.from(
      { length: 5 },
      (_, index) => Math.min(1, Math.max(0, previousAverage - index)),
    )
    selectedRating.value = previousRating
    ratingMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Votre vote n’a pas pu être enregistré.')
      : 'Votre vote n’a pas pu être enregistré.'
  }
  finally {
    savingRating.value = false
  }
}

async function submitComment() {
  commentMessage.value = ''
  commentSuccess.value = false
  submittingComment.value = true
  try {
    await $fetch(`/api/poems/${route.params.id}/comments`, {
      method: 'POST',
      body: {
        pseudonym: pseudonym.value,
        content: commentContent.value,
        website: honeypot.value,
      },
    })
    commentContent.value = ''
    commentSuccess.value = true
    commentMessage.value = 'Merci ! Votre commentaire sera visible après modération.'
  }
  catch (error: unknown) {
    commentMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Votre commentaire n’a pas pu être envoyé.')
      : 'Votre commentaire n’a pas pu être envoyé.'
  }
  finally {
    submittingComment.value = false
  }
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

onMounted(async () => {
  await loadFeedback()
  submissionReadyTimer = setTimeout(() => {
    submissionReady.value = true
  }, 3100)
})

onUnmounted(() => {
  if (submissionReadyTimer) {
    clearTimeout(submissionReadyTimer)
  }
})

useSeoMeta({
  title: () => poem.value?.title ?? 'Poème',
  description: () => poem.value?.excerpt ?? (poem.value?.contentType === 'document' ? 'Document PDF de Yowaki.' : 'Poème de Yowaki.'),
})
</script>

<template>
  <main v-if="poem">
    <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Retour au catalogue</v-btn>
    <article>
      <p class="text-overline">{{ poem.contentType === 'document' ? 'Document PDF' : `Poème ${poem.documentOrder}` }}</p>
      <h1 class="text-h3 text-sm-h2 mb-3">{{ poem.title }}</h1>
      <div class="d-flex flex-wrap ga-2 mb-8">
        <v-chip v-if="poem.collection">{{ poem.collection }}</v-chip>
        <v-chip v-if="poem.form" variant="outlined">{{ poem.form }}</v-chip>
        <v-chip v-if="poem.stanza" variant="outlined">Thème : {{ poem.stanza }}</v-chip>
        <v-chip v-if="poem.meter" variant="outlined">{{ poem.meter }}</v-chip>
        <v-chip v-if="poem.rhymeScheme" variant="outlined">{{ poem.rhymeScheme }}</v-chip>
        <v-chip v-for="language in poem.languages" :key="language" variant="outlined">{{ language }}</v-chip>
        <v-chip v-if="poem.isCalligram" color="secondary">Calligramme</v-chip>
      </div>
      <v-card v-if="poem.contentType === 'poem' && poem.body.trim()" variant="tonal" class="poem-body mb-8">
        <v-card-text>
          <div class="poem-text">{{ poem.body }}</div>
        </v-card-text>
      </v-card>
      <p v-if="poem.excerpt && (poem.contentType === 'document' || !poem.body.trim())" class="text-body-1 mb-8">
        {{ poem.excerpt }}
      </p>
      <v-card v-if="poem.media.some((item) => item.kind === 'image')" variant="outlined" class="mb-8">
        <v-card-title>Illustration</v-card-title>
        <v-card-text>
          <v-img
            v-for="media in poem.media.filter((item) => item.kind === 'image')"
            :key="media.id"
            :src="media.url"
            :alt="media.originalFilename || poem.title"
            max-height="600"
            contain
            rounded="lg"
          />
        </v-card-text>
      </v-card>
      <v-card v-if="poem.media.some((item) => item.kind === 'pdf')" variant="outlined" class="mb-8">
        <v-card-title>Document PDF</v-card-title>
        <v-card-text>
          <iframe
            v-for="media in poem.media.filter((item) => item.kind === 'pdf')"
            :key="media.id"
            :src="`/api/poems/${poem.id}/pdf`"
            :title="media.originalFilename || `PDF de ${poem.title}`"
            class="pdf-viewer"
          />
          <v-btn
            v-for="media in poem.media.filter((item) => item.kind === 'pdf')"
            :key="`open-${media.id}`"
            :href="`/api/poems/${poem.id}/pdf`"
            target="_blank"
            rel="noopener"
            variant="text"
            class="mt-2"
          >
            Ouvrir le PDF dans un nouvel onglet
          </v-btn>
        </v-card-text>
      </v-card>
      <v-alert
        v-if="poem.contentType === 'document' && !poem.media.some((item) => item.kind === 'pdf')"
        type="info"
        variant="tonal"
        class="mb-8"
      >
        Le document PDF n’est pas encore disponible.
      </v-alert>
      <v-card v-if="poem.notes" variant="outlined">
        <v-card-title>Notes</v-card-title>
        <v-card-text>{{ poem.notes }}</v-card-text>
      </v-card>
    </article>
    <section class="mt-8" aria-labelledby="feedback-title">
      <h2 id="feedback-title" class="text-h4 mb-4">Votre avis</h2>
      <v-alert v-if="feedbackError" type="error" variant="tonal" class="mb-4">{{ feedbackError }}</v-alert>
      <v-progress-linear v-else-if="feedbackLoading" indeterminate class="mb-4" />
      <template v-else-if="feedback">
        <v-row>
          <v-col cols="12" md="5">
            <v-card height="100%">
              <v-card-title>Noter cette ressource</v-card-title>
              <v-card-text>
                <p class="text-body-2 mb-2">
                  {{ feedback.ratings.count }} {{ feedback.ratings.count === 1 ? 'vote' : 'votes' }}
                </p>
                <div class="d-flex ga-2 mb-4" role="img" :aria-label="ratingDescription">
                  <span
                    v-for="(fill, index) in feedback.ratings.pois"
                    :key="index"
                    class="pea pea-result"
                    :style="{ '--pea-color': pois[index]?.color === 'rainbow' ? '#8E24AA' : pois[index]?.color }"
                    aria-hidden="true"
                  >
                    <span
                      class="pea-fill"
                      :class="{ rainbow: pois[index]?.color === 'rainbow' }"
                      :style="{
                        width: `${fill * 100}%`,
                        backgroundColor: pois[index]?.color === 'rainbow' ? undefined : pois[index]?.color,
                      }"
                    />
                  </span>
                </div>
                <v-divider v-if="feedback.ratings.enabled" class="my-4" />
                <template v-if="feedback.ratings.enabled">
                  <p class="text-body-2 mb-2">{{ feedback.ratings.ownValue ? 'Modifier votre vote :' : 'Choisissez un pois :' }}</p>
                  <div class="d-flex flex-wrap ga-2" role="group" aria-label="Choisir une note">
                    <button
                      v-for="(pea, index) in pois"
                      :key="pea.label"
                      type="button"
                      class="pea pea-choice"
                      :class="{
                        rainbow: pea.color === 'rainbow',
                        selected: selectedRating === index + 1,
                        'choice-filled': index < (hoveredRating ?? selectedRating ?? 0),
                      }"
                      :style="pea.color === 'rainbow' ? {} : { '--pea-color': pea.color }"
                      :aria-label="`Pois ${pea.label}`"
                      :aria-pressed="selectedRating === index + 1"
                      :disabled="savingRating || !submissionReady"
                      @pointerenter="hoveredRating = index + 1"
                      @pointerleave="hoveredRating = null"
                      @focus="hoveredRating = index + 1"
                      @blur="hoveredRating = null"
                      @click="submitRating(index + 1)"
                    >
                      <span class="sr-only">{{ pea.label }}</span>
                    </button>
                  </div>
                  <p v-if="!submissionReady" class="text-caption text-medium-emphasis mt-2">
                    Le vote sera disponible dans quelques secondes.
                  </p>
                  <v-alert v-if="ratingMessage" :type="ratingMessage.includes('enregistré') ? 'success' : 'error'" variant="tonal" class="mt-3" role="status">
                    {{ ratingMessage }}
                  </v-alert>
                </template>
                <p v-else class="text-body-2 text-medium-emphasis mb-0">Les votes sont désactivés pour cette ressource.</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card height="100%">
              <v-card-title>Commentaires ({{ feedback.comments.total }})</v-card-title>
              <v-card-text>
                <p v-if="feedback.comments.data.length === 0" class="text-body-2 text-medium-emphasis">
                  Aucun commentaire publié pour le moment.
                </p>
                <div v-else class="d-flex flex-column ga-4 mb-5">
                  <article v-for="comment in feedback.comments.data" :key="comment.id" class="public-comment">
                    <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-1">
                      <h3 class="text-subtitle-1">{{ comment.pseudonym }}</h3>
                      <time class="text-caption text-medium-emphasis" :datetime="comment.createdAt">
                        {{ formatCommentDate(comment.createdAt) }}
                      </time>
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>
                  </article>
                </div>
                <v-divider v-if="feedback.comments.enabled && feedback.comments.data.length" class="mb-5" />
                <template v-if="feedback.comments.enabled">
                  <h3 class="text-h6 mb-3">Laisser un commentaire</h3>
                  <v-alert v-if="commentMessage" :type="commentSuccess ? 'success' : 'error'" variant="tonal" class="mb-3" role="status">
                    {{ commentMessage }}
                  </v-alert>
                  <form @submit.prevent="submitComment">
                    <v-text-field
                      v-model="pseudonym"
                      label="Pseudonyme"
                      maxlength="50"
                      counter="50"
                      autocomplete="nickname"
                      required
                      :disabled="submittingComment || !submissionReady"
                    />
                    <v-textarea
                      v-model="commentContent"
                      label="Votre commentaire"
                      maxlength="500"
                      counter="500"
                      rows="4"
                      required
                      :disabled="submittingComment || !submissionReady"
                    />
                    <div class="honeypot-field" aria-hidden="true">
                      <label for="feedback-website">Site web</label>
                      <input id="feedback-website" v-model="honeypot" name="website" type="text" tabindex="-1" autocomplete="off">
                    </div>
                    <p class="text-caption text-medium-emphasis">
                      Votre commentaire sera publié après validation par l’administration.
                    </p>
                    <p v-if="!submissionReady" class="text-caption text-medium-emphasis">
                      L’envoi sera disponible dans quelques secondes.
                    </p>
                    <v-btn
                      type="submit"
                      color="primary"
                      :loading="submittingComment"
                      :disabled="!submissionReady || !pseudonym.trim() || !commentContent.trim()"
                    >
                      Envoyer le commentaire
                    </v-btn>
                  </form>
                </template>
                <p v-else class="text-body-2 text-medium-emphasis mb-0">
                  Les commentaires sont désactivés pour cette ressource.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </section>
  </main>
</template>

<style scoped>
.pea {
  display: inline-block;
  position: relative;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  overflow: hidden;
  border: 2px solid #777;
  border-radius: 50%;
  background: #e3e3e3;
}

.pea-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
}

.pea-result {
  border-color: var(--pea-color);
}

.pea-fill.rainbow,
.pea-choice.choice-filled.rainbow {
  background: conic-gradient(#e53935, #fb8c00, #fdd835, #43a047, #1e88e5, #8e24aa, #e53935);
}

.pea-choice {
  cursor: pointer;
}

.pea-choice:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.pea-choice:not(:disabled):hover,
.pea-choice:focus-visible,
.pea-choice.selected {
  outline: 3px solid #292a29;
  outline-offset: 3px;
}

.pea-choice.choice-filled:not(.rainbow) {
  border-color: var(--pea-color);
  background: var(--pea-color);
}

.public-comment + .public-comment {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.comment-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.honeypot-field {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.poem-text {
  white-space: pre-wrap;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  line-height: 1.8;
}

.pdf-viewer {
  width: 100%;
  min-height: 70vh;
  border: 0;
}
</style>
