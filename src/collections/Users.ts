import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Tên hiển thị ở dòng tác giả (không lộ email ra ngoài trang)
    { name: 'name', type: 'text' },
  ],
}
