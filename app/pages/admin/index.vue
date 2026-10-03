<script setup lang="ts">
const { user, clear: clearSession } = useUserSession()

definePageMeta({
  middleware: [
    async () => {
      const { loggedIn } = useUserSession()
      if (!loggedIn.value) {
        return navigateTo('/login')
      }
    },
  ],
})

interface AdminPoem {
  id: number
  documentOrder: number
  title: string
  contentType: 'poem' | 'document'
  collection: string | null
  form: string | null
  isCalligram: boolean
  updatedAt: string
}

interface EditablePoem extends AdminPoem {
  body: string
  excerpt: string | null
  form: string | null
  stanza: string | null
  meter: string | null
  rhymeScheme: string | null
  languages: string[]
  creationDate: string | null
  notes: string | null
  media: Array<{
    id: number
    kind: 'image' | 'pdf'
    url: string
    mimeType: string
    originalFilename: string | null
  }>
}

interface AdminPoemsResponse {
  data: AdminPoem[]
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
  themes: string[]
  meters: string[]
  rhymeSchemes: string[]
  languages: string[]
}

const search = ref('')
const collection = ref('')
const form = ref('')
const language = ref('')
const calligram = ref(false)
const searchScope = ref<'all' | 'title'>('all')
const sort = ref('order-asc')
const page = ref(1)
const { data: references } = await useFetch<ReferencesResponse>('/api/poems/references')
const adminQuery = computed(() => ({
  search: search.value || undefined,
  collection: collection.value || undefined,
  form: form.value || undefined,
  language: language.value || undefined,
  calligram: calligram.value ? 'true' : undefined,
  searchScope: searchScope.value,
  sort: sort.value,
  page: page.value,
}))
const { data: poemsResponse, status: poemsStatus, error: poemsError } = await useFetch<AdminPoemsResponse>('/api/admin/poems', {
  query: adminQuery,
  watch: [adminQuery],
  default: () => ({
    data: [],
    pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 },
  }),
})
const poems = computed(() => poemsResponse.value?.data ?? [])
const selectedId = ref<number | null>(null)
const selectedPoem = ref<EditablePoem | null>(null)
const saveError = ref('')
const saveSuccess = ref(false)
const saving = ref(false)
const mediaKind = ref<'image' | 'pdf'>('image')
const mediaFile = ref<File | null>(null)
const mediaError = ref('')
const mediaSuccess = ref('')
const uploadingMedia = ref(false)
const deletingMedia = ref<string | null>(null)
const creating = ref(false)
const createError = ref('')
const createDialog = ref(false)
const newPoem = ref({
  title: '',
  body: '',
  excerpt: null as string | null,
  contentType: 'poem' as 'poem' | 'document',
  collection: null as string | null,
  form: null as string | null,
  stanza: null as string | null,
  meter: null as string | null,
  rhymeScheme: null as string | null,
  languages: [] as string[],
  notes: null as string | null,
  isCalligram: false,
})

watch([search, collection, form, language, calligram, searchScope, sort], () => {
  page.value = 1
})

function clearFilters() {
  search.value = ''
  collection.value = ''
  form.value = ''
  language.value = ''
  calligram.value = false
  searchScope.value = 'all'
  sort.value = 'order-asc'
  page.value = 1
}

function openCreateDialog() {
  createError.value = ''
  newPoem.value = {
    title: '',
    body: '',
    excerpt: null,
    contentType: 'poem',
    collection: null,
    form: null,
    stanza: null,
    meter: null,
    rhymeScheme: null,
    languages: [],
    notes: null,
    isCalligram: false,
  }
  createDialog.value = true
}

async function createPoem() {
  creating.value = true
  createError.value = ''
  try {
    const created = await $fetch<EditablePoem>('/api/admin/poems', {
      method: 'POST',
      body: newPoem.value,
    })
    createDialog.value = false
    await refreshNuxtData('/api/admin/poems')
    await editPoem(created.id)
  } catch (error: unknown) {
    createError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Création impossible.')
      : 'Création impossible.'
  } finally {
    creating.value = false
  }
}

async function editPoem(id: number) {
  saveError.value = ''
  saveSuccess.value = false
  mediaError.value = ''
  mediaSuccess.value = ''
  mediaFile.value = null
  selectedPoem.value = await $fetch<EditablePoem>(`/api/poems/${id}`)
  selectedId.value = id
}

async function savePoem() {
  if (!selectedPoem.value || selectedId.value === null) {
    return
  }

  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await $fetch(`/api/admin/poems/${selectedId.value}`, {
      method: 'PATCH',
      body: selectedPoem.value,
    })
    saveSuccess.value = true
    await refreshNuxtData('/api/admin/poems')
  } catch (error: unknown) {
    saveError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Enregistrement impossible.')
      : 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}

async function uploadMedia() {
  if (!selectedPoem.value || !mediaFile.value) {
    return
  }

  uploadingMedia.value = true
  mediaError.value = ''
  mediaSuccess.value = ''
  try {
    const formData = new FormData()
    formData.append('kind', mediaKind.value)
    formData.append('file', mediaFile.value)
    const media = await $fetch<EditablePoem['media'][number]>(
      `/api/admin/poems/${selectedPoem.value.id}/media`,
      { method: 'POST', body: formData },
    )
    selectedPoem.value.media = [
      ...selectedPoem.value.media.filter((item) => item.kind !== media.kind),
      media,
    ]
    mediaFile.value = null
    mediaSuccess.value = 'Média téléversé.'
  } catch (error: unknown) {
    mediaError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Téléversement impossible.')
      : 'Téléversement impossible.'
  } finally {
    uploadingMedia.value = false
  }
}

async function deleteMedia(kind: 'image' | 'pdf') {
  if (!selectedPoem.value || !window.confirm(`Supprimer le ${kind === 'image' ? 'média image' : 'PDF'} ?`)) {
    return
  }

  deletingMedia.value = kind
  mediaError.value = ''
  mediaSuccess.value = ''
  try {
    await $fetch(`/api/admin/poems/${selectedPoem.value.id}/media`, {
      method: 'DELETE',
      query: { kind },
    })
    selectedPoem.value.media = selectedPoem.value.media.filter((item) => item.kind !== kind)
    mediaSuccess.value = 'Média supprimé.'
  } catch (error: unknown) {
    mediaError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Suppression impossible.')
      : 'Suppression impossible.'
  } finally {
    deletingMedia.value = null
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/')
}

useSeoMeta({
  title: 'Administration | Yowaki',
})
</script>

<template>
  <main>
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-8">
      <div>
        <p class="text-overline">Administration</p>
        <h1 class="text-h3">Bienvenue</h1>
      </div>
      <div class="d-flex flex-wrap ga-3">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">Nouvelle ressource</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-logout" @click="logout">Se déconnecter</v-btn>
      </div>
    </div>
    <v-card class="mb-6">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field v-model="search" label="Rechercher dans le titre ou le texte" prepend-inner-icon="mdi-magnify" clearable hide-details />
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-md-end">
            <div class="d-flex align-center ga-2">
              <span class="text-body-2 text-medium-emphasis">Rechercher dans</span>
              <v-btn-toggle v-model="searchScope" mandatory density="compact" color="primary" variant="outlined">
                <v-btn value="all">Tout</v-btn>
                <v-btn value="title">Titre</v-btn>
              </v-btn-toggle>
            </div>
          </v-col>
        </v-row>
        <v-row align="center" class="mt-1">
          <v-col cols="12" md="4">
            <v-select v-model="sort" :items="[
              { title: 'Ordre croissant', value: 'order-asc' },
              { title: 'Ordre décroissant', value: 'order-desc' },
              { title: 'Nom (A-Z)', value: 'title-asc' },
              { title: 'Nom (Z-A)', value: 'title-desc' },
            ]" label="Trier par" hide-details />
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-md-end">
            <v-checkbox v-model="calligram" label="Calligrammes" hide-details />
          </v-col>
        </v-row>
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
        <v-btn variant="text" prepend-icon="mdi-filter-off" @click="clearFilters">Réinitialiser</v-btn>
      </v-card-text>
    </v-card>
    <v-alert v-if="poemsError" type="error" class="mb-4">Impossible de charger les poèmes administrables.</v-alert>
    <v-progress-linear v-else-if="poemsStatus === 'pending'" indeterminate class="mb-4" />
    <v-row v-else>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>Ressources ({{ poemsResponse?.pagination.total ?? 0 }})</v-card-title>
          <v-table density="comfortable" fixed-header height="70vh">
            <thead>
              <tr><th>Ordre</th><th>Titre</th><th>Type</th><th>Collection</th><th>Forme</th></tr>
            </thead>
            <tbody>
            <tr
              v-for="poem in poems"
              :key="poem.id"
              :class="{ 'selected-row': selectedId === poem.id }"
              @click="editPoem(poem.id)"
            >
              <td>{{ poem.documentOrder }}</td>
              <td>{{ poem.title }}</td>
              <td>{{ poem.contentType === 'document' ? 'PDF' : 'Poème' }}</td>
              <td>{{ poem.collection || '—' }}</td>
              <td>{{ poem.form || '—' }}</td>
            </tr>
            </tbody>
          </v-table>
          <v-pagination v-if="poemsResponse && poemsResponse.pagination.totalPages > 1" v-model="page" :length="poemsResponse.pagination.totalPages" :total-visible="5" class="my-3" />
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card v-if="selectedPoem">
          <v-card-title>Modifier « {{ selectedPoem.title }} »</v-card-title>
          <v-card-text>
            <v-alert v-if="saveError" type="error" variant="tonal" class="mb-4">{{ saveError }}</v-alert>
            <v-alert v-if="saveSuccess" type="success" variant="tonal" class="mb-4">Ressource enregistrée.</v-alert>
            <v-select
              v-model="selectedPoem.contentType"
              :items="[
                { title: 'Poème', value: 'poem' },
                { title: 'Document PDF', value: 'document' },
              ]"
              label="Type de ressource"
            />
            <v-text-field v-model="selectedPoem.title" label="Titre" />
            <v-textarea
              v-if="selectedPoem.contentType === 'poem'"
              v-model="selectedPoem.body"
              label="Texte"
              rows="12"
              required
            />
            <v-textarea v-model="selectedPoem.excerpt" label="Extrait (facultatif)" rows="3" clearable />
            <v-row>
              <v-col cols="12" sm="6"><v-combobox v-model="selectedPoem.collection" :items="references?.collections" label="Collection" clearable /></v-col>
              <v-col cols="12" sm="6"><v-combobox v-model="selectedPoem.form" :items="references?.forms" label="Forme" clearable /></v-col>
              <v-col cols="12" sm="6"><v-combobox v-model="selectedPoem.stanza" :items="references?.themes" label="Thème" clearable /></v-col>
              <v-col cols="12" sm="6"><v-combobox v-model="selectedPoem.meter" :items="references?.meters" label="Métrique" clearable /></v-col>
            </v-row>
            <v-combobox v-model="selectedPoem.rhymeScheme" :items="references?.rhymeSchemes" label="Schéma de rimes" clearable />
            <v-combobox v-model="selectedPoem.languages" :items="references?.languages" label="Langue(s)" multiple chips clearable />
            <v-textarea v-model="selectedPoem.notes" label="Notes publiques" rows="4" clearable />
            <v-checkbox v-model="selectedPoem.isCalligram" label="Calligramme" />
            <v-btn color="primary" :loading="saving" @click="savePoem">Enregistrer</v-btn>
            <v-divider class="my-6" />
            <h3 class="text-h6 mb-3">Médias</h3>
            <v-alert
              v-if="selectedPoem.contentType === 'document' && !selectedPoem.media.some((item) => item.kind === 'pdf')"
              type="warning"
              variant="tonal"
              class="mb-3"
            >
              Téléversez le PDF pour que le document soit consultable.
            </v-alert>
            <v-alert
              v-else-if="selectedPoem.contentType === 'document' && !selectedPoem.media.some((item) => item.kind === 'image')"
              type="info"
              variant="tonal"
              class="mb-3"
            >
              Ajoutez une image de couverture ou de première page pour illustrer le document dans le catalogue.
            </v-alert>
            <p class="text-body-2 text-medium-emphasis mb-3">
              Pour un document PDF, téléversez le PDF et, séparément, une image de couverture ou de première page.
            </p>
            <v-alert v-if="mediaError" type="error" variant="tonal" class="mb-3">{{ mediaError }}</v-alert>
            <v-alert v-if="mediaSuccess" type="success" variant="tonal" class="mb-3">{{ mediaSuccess }}</v-alert>
            <v-select v-model="mediaKind" :items="[
              { title: 'Image', value: 'image' },
              { title: 'PDF', value: 'pdf' },
            ]" label="Type de média" />
            <v-file-input
              v-model="mediaFile"
              :accept="mediaKind === 'image' ? 'image/*' : 'application/pdf'"
              label="Fichier (10 Mo maximum)"
              show-size
              clearable
            />
            <v-btn variant="outlined" :loading="uploadingMedia" :disabled="!mediaFile" @click="uploadMedia">
              Téléverser le média
            </v-btn>
            <div v-if="selectedPoem.media.length" class="text-body-2 mt-4">
              <div v-for="media in selectedPoem.media" :key="media.id" class="d-flex align-center justify-space-between ga-3 mb-2">
                <div class="d-flex align-center ga-3">
                  <v-dialog v-if="media.kind === 'image'" max-width="900">
                    <template #activator="{ props }">
                      <v-img v-bind="props" :src="media.url" :alt="media.originalFilename || selectedPoem.title" width="72" height="72" cover rounded="lg" class="media-thumbnail" />
                    </template>
                    <template #default="{ isActive }">
                      <v-card>
                        <v-img :src="media.url" :alt="media.originalFilename || selectedPoem.title" max-height="80vh" contain />
                        <v-card-actions><v-spacer /><v-btn variant="text" @click="isActive.value = false">Fermer</v-btn></v-card-actions>
                      </v-card>
                    </template>
                  </v-dialog>
                  <span>{{ media.kind === 'image' ? 'Image' : 'PDF' }} : {{ media.originalFilename || media.url }}</span>
                </div>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  :loading="deletingMedia === media.kind"
                  @click="deleteMedia(media.kind)"
                >
                  Supprimer
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <v-alert v-else type="info" variant="tonal">Sélectionnez un poème à modifier.</v-alert>
      </v-col>
    </v-row>
    <p class="text-body-2 text-medium-emphasis mt-4">Connecté avec {{ user?.email }}</p>
    <v-dialog v-model="createDialog" max-width="720">
      <v-card>
        <v-card-title>Nouvelle ressource</v-card-title>
        <v-card-text>
          <v-alert v-if="createError" type="error" variant="tonal" class="mb-4">{{ createError }}</v-alert>
          <v-select
            v-model="newPoem.contentType"
            :items="[
              { title: 'Poème', value: 'poem' },
              { title: 'Document PDF', value: 'document' },
            ]"
            label="Type de ressource"
          />
          <v-text-field v-model="newPoem.title" label="Titre" required />
          <v-textarea
            v-if="newPoem.contentType === 'poem'"
            v-model="newPoem.body"
            label="Texte"
            rows="12"
            required
          />
          <p v-else class="text-body-2 text-medium-emphasis">
            Après la création, téléversez le PDF et, séparément, une image de couverture ou de première page.
          </p>
          <v-textarea v-model="newPoem.excerpt" label="Extrait (facultatif)" rows="3" clearable />
          <v-row>
            <v-col cols="12" sm="6"><v-combobox v-model="newPoem.collection" :items="references?.collections" label="Collection" clearable /></v-col>
            <v-col cols="12" sm="6"><v-combobox v-model="newPoem.form" :items="references?.forms" label="Forme" clearable /></v-col>
            <v-col cols="12" sm="6"><v-combobox v-model="newPoem.stanza" :items="references?.themes" label="Thème" clearable /></v-col>
            <v-col cols="12" sm="6"><v-combobox v-model="newPoem.meter" :items="references?.meters" label="Métrique" clearable /></v-col>
          </v-row>
          <v-combobox v-model="newPoem.rhymeScheme" :items="references?.rhymeSchemes" label="Schéma de rimes" clearable />
          <v-combobox v-model="newPoem.languages" :items="references?.languages" label="Langue(s)" multiple chips clearable />
          <v-textarea v-model="newPoem.notes" label="Notes publiques" rows="4" clearable />
          <v-checkbox v-model="newPoem.isCalligram" label="Calligramme" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="creating" @click="createPoem">Créer la ressource</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

<style scoped>
.selected-row {
  background: rgba(var(--v-theme-primary), 0.12);
  cursor: pointer;
}

.media-thumbnail {
  cursor: zoom-in;
  flex: 0 0 auto;
}
</style>
