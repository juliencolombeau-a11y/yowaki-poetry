<script setup lang="ts">
interface Poem {
  id: number
  documentOrder: number
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

const route = useRoute()
const { data: poem, error } = await useFetch<Poem>(`/api/poems/${route.params.id}`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Poème introuvable.',
  })
}

useSeoMeta({
  title: () => poem.value?.title ?? 'Poème',
  description: () => poem.value?.excerpt ?? 'Poème de Yowaki.',
})
</script>

<template>
  <main v-if="poem">
    <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Retour au catalogue</v-btn>
    <article>
      <p class="text-overline">Poème {{ poem.documentOrder }}</p>
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
      <v-card variant="tonal" class="poem-body mb-8">
        <v-card-text>
          <div class="poem-text">{{ poem.body }}</div>
        </v-card-text>
      </v-card>
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
            :src="media.url"
            :title="media.originalFilename || `PDF de ${poem.title}`"
            class="pdf-viewer"
          />
        </v-card-text>
      </v-card>
      <v-card v-if="poem.notes" variant="outlined">
        <v-card-title>Notes</v-card-title>
        <v-card-text>{{ poem.notes }}</v-card-text>
      </v-card>
    </article>
  </main>
</template>

<style scoped>
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
