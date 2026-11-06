import type { CollectionConfig } from 'payload'

// Bước 5: sinh slug từ tiêu đề (bỏ dấu tiếng Việt)
export const toSlug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Bước 3: collection News → bảng "news", form trên /admin, API /api/news
export const News: CollectionConfig = {
  slug: 'news',
  admin: { useAsTitle: 'title' },
  versions: { drafts: true },
  // Bước 4: chưa đăng nhập → chỉ thấy bài đã xuất bản
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.title ? toSlug(data.title) : value)],
      },
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', index: true },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText', localized: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
  ],
}
