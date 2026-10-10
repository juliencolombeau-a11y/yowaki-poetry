import { requireAdmin } from '../../utils/auth'
import { getFeedbackSettings } from '../../utils/feedback'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const settings = await getFeedbackSettings()
  return {
    ratingsEnabled: settings.ratingsEnabled,
    commentsEnabled: settings.commentsEnabled,
  }
})
