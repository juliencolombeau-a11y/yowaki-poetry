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
const sort = ref('date-desc')
const page = ref(1)
const filtersExpanded = ref(false)

const { data: references } = await useFetch<ReferencesResponse>('/api/poems/references')
const query = computed(() => ({
  search: search.value || undefined,
  collection: collection.value || undefined,
  form: form.value || undefined,
  language: language.value || undefined,
  calligram: calligram.value ? 'true' : undefined,
  sort: sort.value,
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

watch([search, collection, form, language, calligram, sort], () => {
  page.value = 1
})

function clearFilters() {
  search.value = ''
  collection.value = ''
  form.value = ''
  language.value = ''
  calligram.value = false
  sort.value = 'date-desc'
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
      <v-img
        src="https://res.cloudinary.com/dqc9sksg/image/upload/c_crop,w_1920,h_540,x_0,y_150/v1790426661/Bandeau_site_de_po%C3%A8mes_Yowaki.png"
        alt="Yowaki - créations diverses"
        :aspect-ratio="32 / 9"
        cover
        rounded="xl"
      />
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
        <v-btn
          variant="text"
          block
          class="justify-space-between"
          :aria-expanded="filtersExpanded"
          aria-controls="poem-filters"
          :append-icon="filtersExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="filtersExpanded = !filtersExpanded"
        >
          Filtres
        </v-btn>
        <v-expand-transition>
          <div v-show="filtersExpanded" id="poem-filters">
            <v-row align="center" class="mt-1">
              <v-col cols="12" sm="4">
                <v-select v-model="collection" :items="references?.collections" label="Collection" clearable hide-details />
              </v-col>
              <v-col cols="12" sm="4">
                <v-select v-model="form" :items="references?.forms" label="Forme" clearable hide-details />
              </v-col>
              <v-col cols="12" sm="4">
                <v-select v-model="language" :items="references?.languages" label="Langue" clearable hide-details />
              </v-col>
            </v-row>
            <v-row align="center" class="mt-1">
              <v-col cols="12" sm="4">
                <v-checkbox v-model="calligram" label="Calligrammes" hide-details class="calligram-filter" />
              </v-col>
              <v-col cols="12" sm="8">
                <v-select v-model="sort" :items="[
                  { title: 'Date : plus récent → plus ancien', value: 'date-desc' },
                  { title: 'Date : plus ancien → plus récent', value: 'date-asc' },
                  { title: 'Nom (A-Z)', value: 'title-asc' },
                  { title: 'Nom (Z-A)', value: 'title-desc' },
                ]" label="Trier par" hide-details />
              </v-col>
              <v-col cols="12" class="pt-0">
                <p class="text-caption text-medium-emphasis mb-0">
                  Les poèmes sans date sont triés selon leur ordre dans le recueil.
                </p>
              </v-col>
            </v-row>
            <v-btn variant="text" prepend-icon="mdi-filter-off" @click="clearFilters">Réinitialiser</v-btn>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4">
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
.calligram-filter :deep(.v-label) {
  white-space: nowrap;
}
</style>
