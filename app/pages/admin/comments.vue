<script setup lang="ts">
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

interface CommentItem {
  id: number
  poemId: number
  poemTitle: string
  pseudonym: string
  content: string
  status: 'pending' | 'approved'
  createdAt: string
  moderatedAt: string | null
}

interface CommentsResponse {
  data: CommentItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface FeedbackSettings {
  ratingsEnabled: boolean
  commentsEnabled: boolean
}

const statusFilter = ref<'all' | 'pending' | 'approved'>('pending')
const page = ref(1)
const busyCommentId = ref<number | null>(null)
const actionError = ref('')
const actionSuccess = ref('')
const settingsSaving = ref(false)
const settingsError = ref('')
const settingsSuccess = ref('')

const { data: commentsResponse, status, error, refresh } = await useFetch<CommentsResponse>('/api/admin/comments', {
  query: computed(() => ({ status: statusFilter.value, page: page.value })),
  watch: [statusFilter, page],
  default: () => ({
    data: [],
    pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 },
  }),
})
const comments = computed(() => commentsResponse.value?.data ?? [])
const { data: feedbackSettings, error: feedbackSettingsLoadError, refresh: refreshSettings } = await useFetch<FeedbackSettings>('/api/admin/feedback-settings', {
  default: () => ({ ratingsEnabled: true, commentsEnabled: true }),
})

watch(statusFilter, () => {
  page.value = 1
})

async function moderateComment(comment: CommentItem, nextStatus: 'pending' | 'approved') {
  actionError.value = ''
  actionSuccess.value = ''
  busyCommentId.value = comment.id
  try {
    await $fetch(`/api/admin/comments/${comment.id}`, {
      method: 'PATCH',
      body: { status: nextStatus },
    })
    actionSuccess.value = nextStatus === 'approved' ? 'Commentaire publié.' : 'Commentaire replacé en attente.'
    await refresh()
  } catch (requestError: unknown) {
    actionError.value = requestError && typeof requestError === 'object' && 'data' in requestError
      ? String((requestError as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'La modération a échoué.')
      : 'La modération a échoué.'
  } finally {
    busyCommentId.value = null
  }
}

async function deleteComment(comment: CommentItem) {
  if (!window.confirm(`Supprimer définitivement le commentaire de ${comment.pseudonym} sur « ${comment.poemTitle} » ?`)) {
    return
  }

  actionError.value = ''
  actionSuccess.value = ''
  busyCommentId.value = comment.id
  try {
    await $fetch(`/api/admin/comments/${comment.id}`, { method: 'DELETE' })
    actionSuccess.value = 'Commentaire supprimé.'
    await refresh()
  } catch (requestError: unknown) {
    actionError.value = requestError && typeof requestError === 'object' && 'data' in requestError
      ? String((requestError as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'La suppression a échoué.')
      : 'La suppression a échoué.'
  } finally {
    busyCommentId.value = null
  }
}

async function saveSettings() {
  if (!feedbackSettings.value) {
    return
  }

  settingsSaving.value = true
  settingsError.value = ''
  settingsSuccess.value = ''
  try {
    feedbackSettings.value = await $fetch<FeedbackSettings>('/api/admin/feedback-settings', {
      method: 'PATCH',
      body: {
        ratingsEnabled: feedbackSettings.value.ratingsEnabled,
        commentsEnabled: feedbackSettings.value.commentsEnabled,
      },
    })
    settingsSuccess.value = 'Réglages généraux enregistrés.'
  } catch (requestError: unknown) {
    settingsError.value = requestError && typeof requestError === 'object' && 'data' in requestError
      ? String((requestError as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Enregistrement impossible.')
      : 'Enregistrement impossible.'
  } finally {
    settingsSaving.value = false
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

useSeoMeta({ title: 'Modération des commentaires | Yowaki' })
</script>

<template>
  <main>
    <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-8">
      <div>
        <p class="text-overline">Administration</p>
        <h1 class="text-h3">Contributions</h1>
      </div>
      <v-btn to="/admin" variant="outlined" prepend-icon="mdi-arrow-left">Retour à l’administration</v-btn>
    </div>

    <v-card class="mb-6">
      <v-card-title>Activation générale</v-card-title>
      <v-card-text>
        <v-alert v-if="feedbackSettingsLoadError" type="error" variant="tonal" class="mb-3">
          Impossible de charger les réglages généraux.
        </v-alert>
        <template v-else-if="feedbackSettings">
          <v-alert v-if="settingsError" type="error" variant="tonal" class="mb-3">{{ settingsError }}</v-alert>
          <v-alert v-if="settingsSuccess" type="success" variant="tonal" class="mb-3">{{ settingsSuccess }}</v-alert>
          <v-switch v-model="feedbackSettings.ratingsEnabled" label="Autoriser les notes sur toutes les fiches" color="primary" hide-details />
          <v-switch v-model="feedbackSettings.commentsEnabled" label="Autoriser les commentaires sur toutes les fiches" color="primary" hide-details class="mb-3" />
          <v-btn color="primary" :loading="settingsSaving" @click="saveSettings">Enregistrer les réglages généraux</v-btn>
        </template>
      </v-card-text>
    </v-card>

    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
      <h2 class="text-h5">Modération des commentaires ({{ commentsResponse?.pagination.total ?? 0 }})</h2>
      <v-select
        v-model="statusFilter"
        :items="[
          { title: 'En attente', value: 'pending' },
          { title: 'Publiés', value: 'approved' },
          { title: 'Tous', value: 'all' },
        ]"
        label="Filtrer par statut"
        hide-details
        class="status-filter"
      />
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      Impossible de charger les commentaires à modérer.
    </v-alert>
    <v-alert v-if="actionError" type="error" variant="tonal" class="mb-4">{{ actionError }}</v-alert>
    <v-alert v-if="actionSuccess" type="success" variant="tonal" class="mb-4">{{ actionSuccess }}</v-alert>
    <v-progress-linear v-if="status === 'pending'" indeterminate class="mb-4" />

    <div v-else-if="comments.length" class="d-flex flex-column ga-4">
      <v-card v-for="comment in comments" :key="comment.id" variant="outlined">
        <v-card-text>
          <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-3">
            <div>
              <h3 class="text-h6">{{ comment.pseudonym }}</h3>
              <p class="text-body-2 mb-0">
                Sur <NuxtLink :to="`/poems/${comment.poemId}`">{{ comment.poemTitle }}</NuxtLink>
              </p>
            </div>
            <div class="d-flex flex-column align-start align-sm-end ga-1">
              <time class="text-caption" :datetime="comment.createdAt">Reçu le {{ formatDate(comment.createdAt) }}</time>
              <time v-if="comment.moderatedAt" class="text-caption text-medium-emphasis" :datetime="comment.moderatedAt">
                Modéré le {{ formatDate(comment.moderatedAt) }}
              </time>
              <v-chip size="small" :color="comment.status === 'approved' ? 'success' : 'warning'">
                {{ comment.status === 'approved' ? 'Publié' : 'En attente' }}
              </v-chip>
            </div>
          </div>
          <p class="comment-content mb-4">{{ comment.content }}</p>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-if="comment.status === 'pending'"
              color="success"
              prepend-icon="mdi-check"
              :loading="busyCommentId === comment.id"
              @click="moderateComment(comment, 'approved')"
            >
              Publier
            </v-btn>
            <v-btn
              v-else
              variant="outlined"
              prepend-icon="mdi-eye-off"
              :loading="busyCommentId === comment.id"
              @click="moderateComment(comment, 'pending')"
            >
              Retirer de la publication
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              :loading="busyCommentId === comment.id"
              @click="deleteComment(comment)"
            >
              Supprimer
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
      <v-pagination
        v-if="commentsResponse && commentsResponse.pagination.totalPages > 1"
        v-model="page"
        :length="commentsResponse.pagination.totalPages"
        :total-visible="5"
        class="my-3"
      />
    </div>
    <v-alert v-else type="info" variant="tonal">
      Aucun commentaire {{ statusFilter === 'pending' ? 'en attente' : statusFilter === 'approved' ? 'publié' : '' }}.
    </v-alert>
  </main>
</template>

<style scoped>
.status-filter {
  max-width: 240px;
}

.comment-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
