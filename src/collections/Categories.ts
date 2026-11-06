import type { CollectionConfig } from 'payload'
import { toSlug } from './News'

// Chuyên mục bài viết: /c/<slug>
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [({ value, data }) => value || (data?.name ? toSlug(data.name) : value)],
      },
    },
  ],
}
