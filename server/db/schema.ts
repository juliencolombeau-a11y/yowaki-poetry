import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const poems = sqliteTable(
  'poems',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    legacyId: integer('legacy_id'),
    documentOrder: integer('document_order').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    excerpt: text('excerpt'),
    collection: text('collection'),
    form: text('form'),
    stanza: text('stanza'),
    meter: text('meter'),
    rhymeScheme: text('rhyme_scheme'),
    isCalligram: integer('is_calligram', { mode: 'boolean' }).notNull().default(false),
    contentType: text('content_type').notNull().default('poem'),
    creationDate: text('creation_date'),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    legacyIdUnique: uniqueIndex('poems_legacy_id_unique').on(table.legacyId),
    documentOrderUnique: uniqueIndex('poems_document_order_unique').on(table.documentOrder),
    titleIndex: index('poems_title_idx').on(table.title),
    collectionIndex: index('poems_collection_idx').on(table.collection),
    formIndex: index('poems_form_idx').on(table.form),
    meterIndex: index('poems_meter_idx').on(table.meter),
    calligramIndex: index('poems_calligram_idx').on(table.isCalligram),
  }),
)

export const themes = sqliteTable(
  'themes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex('themes_name_unique').on(table.name),
  }),
)

export const languages = sqliteTable(
  'languages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex('languages_name_unique').on(table.name),
  }),
)

export const poemThemes = sqliteTable(
  'poem_themes',
  {
    poemId: integer('poem_id').notNull().references(() => poems.id, { onDelete: 'cascade' }),
    themeId: integer('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    poemThemePrimaryKey: primaryKey({ columns: [table.poemId, table.themeId] }),
  }),
)

export const poemLanguages = sqliteTable(
  'poem_languages',
  {
    poemId: integer('poem_id').notNull().references(() => poems.id, { onDelete: 'cascade' }),
    languageId: integer('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    poemLanguagePrimaryKey: primaryKey({ columns: [table.poemId, table.languageId] }),
  }),
)

export const media = sqliteTable(
  'media',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    poemId: integer('poem_id').notNull().references(() => poems.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['image', 'pdf'] }).notNull(),
    cloudinaryPublicId: text('cloudinary_public_id'),
    cloudinaryUrl: text('cloudinary_url').notNull(),
    mimeType: text('mime_type').notNull(),
    originalFilename: text('original_filename'),
    sizeBytes: integer('size_bytes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    poemKindUnique: uniqueIndex('media_poem_kind_unique').on(table.poemId, table.kind),
  }),
)

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['admin'] }).notNull().default('admin'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
  }),
)
