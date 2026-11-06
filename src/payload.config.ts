import { postgresAdapter } from '@payloadcms/db-postgres'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { privateBlobAdapter } from './storage/privateBlob'
import { Categories } from './collections/Categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, News],
  localization: {
    locales: ['vi', 'ja'],
    defaultLocale: 'vi',
  },
  // Thanh công cụ cố định phía trên ô soạn thảo (mặc định chỉ hiện khi bôi đen chữ)
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Dev-mode schema sync only against a local DB; remote DBs (Supabase) change via migrations only
    push: /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(process.env.DATABASE_URL || ''),
  }),
  sharp,
  plugins: [
    // Có token (trên Vercel) → ảnh lưu ở Vercel Blob PRIVATE, phục vụ qua /api/media/file;
    // local không có token → vẫn lưu vào thư mục media/
    cloudStoragePlugin({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true, // giữ cột media._objectkey cả khi tắt → schema local = production
      collections: {
        media: { adapter: privateBlobAdapter(process.env.BLOB_READ_WRITE_TOKEN || '') },
      },
    }),
  ],
})
