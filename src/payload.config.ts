import { postgresAdapter } from '@payloadcms/db-postgres'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { News } from './collections/News'
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
  }),
  sharp,
  plugins: [
    // Có token (trên Vercel) → ảnh lưu ở Vercel Blob; local không có token → vẫn lưu vào thư mục media/
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // URL ảnh trỏ thẳng tới Blob CDN thay vì đi qua /api/media/file (media vốn public)
      collections: { media: { disablePayloadAccessControl: true } },
      clientUploads: true, // bỏ qua giới hạn 4.5MB request body của Vercel
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
