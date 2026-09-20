<script setup lang="ts">
interface Poem {
  id: number
  documentOrder: number
  title: string
  excerpt: string | null
  collection: string | null
  form: string | null
  meter: string | null
  rhymeScheme: string | null
  isCalligram: boolean
  languages: string[]
  image: {
    url: string
    originalFilename: string | null
  } | null
}

interface PoemsResponse {
  data: Poem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface ReferencesResponse {
  collections: string[]
  forms: string[]
  languages: string[]
}

const search = ref('')
const collection = ref('')
const form = ref('')
const language = ref('')
const calligram = ref(false)
const page = ref(1)

const { data: references } = await useFetch<ReferencesResponse>('/api/poems/references')
const query = computed(() => ({
  search: search.value || undefined,
  collection: collection.value || undefined,
  form: form.value || undefined,
  language: language.value || undefined,
  calligram: calligram.value ? 'true' : undefined,
  page: page.value,
}))
const { data: response, status, error } = await useFetch<PoemsResponse>('/api/poems', {
  query,
  watch: [query],
  default: () => ({
    data: [],
    pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
  }),
})

watch([search, collection, form, language, calligram], () => {
  page.value = 1
})

function clearFilters() {
  search.value = ''
  collection.value = ''
  form.value = ''
  language.value = ''
  calligram.value = false
  page.value = 1
}

useSeoMeta({
  title: 'Yowaki - créations diverses',
  description: 'Quelques créations au fil du criterium.',
})
</script>

<template>
  <main>
    <section class="mb-8">
      <div class="banner-placeholder mb-6" aria-label="Emplacement réservé au futur bandeau">
        <span>Emplacement réservé au bandeau</span>
      </div>
      <h1 class="text-h3 text-sm-h2 mb-2">Yowaki - créations diverses</h1>
      <p class="text-h6 text-medium-emphasis">Quelques créations au fil du criterium</p>
    </section>

    <v-text-field
      v-model="search"
      label="Rechercher un poème"
      placeholder="Titre, texte ou collection"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      class="mb-4"
    />

    <v-card variant="tonal" class="mb-8">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" sm="5">
            <v-select v-model="collection" :items="references?.collections" label="Collection" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="5">
            <v-select v-model="form" :items="references?.forms" label="Forme" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="5">
            <v-select v-model="language" :items="references?.languages" label="Langue" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="2">
            <v-checkbox v-model="calligram" label="Calligrammes" hide-details />
          </v-col>
        </v-row>
        <v-btn variant="text" prepend-icon="mdi-filter-off" @click="clearFilters">Réinitialiser</v-btn>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5">Les poèmes</h2>
      <span class="text-body-2 text-medium-emphasis">{{ response?.pagination.total ?? 0 }} résultat(s)</span>
    </div>

    <v-alert v-if="error" type="error" class="mb-4">Le catalogue est momentanément indisponible.</v-alert>
    <v-progress-linear v-else-if="status === 'pending'" indeterminate color="primary" class="mb-4" />
    <v-alert v-else-if="response?.data.length === 0" type="info" variant="tonal">
      Aucun poème ne correspond à votre recherche.
    </v-alert>

    <v-row v-else>
      <v-col v-for="poem in response?.data" :key="poem.id" cols="12" sm="6" lg="4">
        <v-card :to="`/poems/${poem.id}`" class="h-100 d-flex flex-column" rounded="xl" elevation="2">
          <v-img
            v-if="poem.image"
            :src="poem.image.url"
            :alt="poem.image.originalFilename || poem.title"
            height="180"
            cover
          />
          <v-card-item>
            <v-card-title class="text-wrap">{{ poem.title }}</v-card-title>
            <v-card-subtitle v-if="poem.collection">{{ poem.collection }}</v-card-subtitle>
          </v-card-item>
          <v-card-text class="flex-grow-1">
            <div class="d-flex flex-wrap ga-2 mb-3">
              <v-chip v-if="poem.form" size="small">{{ poem.form }}</v-chip>
              <v-chip v-if="poem.meter" size="small" variant="outlined">{{ poem.meter }}</v-chip>
            </div>
            <p class="text-body-2 text-medium-emphasis line-clamp-4 mb-0">{{ poem.excerpt }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text" append-icon="mdi-arrow-right">Lire le poème</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="response && response.pagination.totalPages > 1" class="d-flex justify-center mt-8">
      <v-pagination v-model="page" :length="response.pagination.totalPages" :total-visible="5" />
    </div>
  </main>
</template>

<style scoped>
.banner-placeholder {
  min-height: 150px;
  border: 2px dashed rgba(var(--v-theme-primary), 0.45);
  border-radius: 24px;
  display: grid;
  place-items: center;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
