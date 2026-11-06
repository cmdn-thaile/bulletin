import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from '@payloadcms/richtext-lexical/react'
import config from '@payload-config'
import Link from 'next/link'
import type { Category, Media, User } from '@/payload-types'

// Link nội bộ trong nội dung (chọn bài/chuyên mục khác) → đường dẫn trên trang
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const { relationTo, value } = linkNode.fields.doc ?? {}
      const slug = typeof value === 'object' && value && 'slug' in value ? value.slug : ''
      if (relationTo === 'news') return `/news/${slug}`
      if (relationTo === 'categories') return `/c/${slug}`
      return '/'
    },
  }),
})

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    depth: 1,
    limit: 1,
  })
  const post = docs[0]
  if (!post) notFound()
  const cover = post.cover as Media | null
  const category = post.category as Category | null | undefined
  const author = (post.author as User | null | undefined)?.name

  return (
    <article className="article">
      <header>
        {category?.name && (
          <Link href={`/c/${category.slug}`} className="cat">
            {category.name}
          </Link>
        )}
        <h1>{post.title}</h1>
        <p className="byline">
          {author && <span className="author">{author}</span>}
          Updated{' '}
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(
            new Date(post.updatedAt),
          )}
        </p>
      </header>
      {cover?.url && (
        <figure>
          <Image
            className="cover"
            src={cover.url}
            alt={cover.alt || ''}
            width={cover.width || 1600}
            height={cover.height || 1000}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
          {cover.alt && <figcaption>{cover.alt}</figcaption>}
        </figure>
      )}
      <div className="body">
        {post.content ? <RichText data={post.content} converters={converters} /> : <p>This story has no content yet.</p>}
      </div>
    </article>
  )
}
