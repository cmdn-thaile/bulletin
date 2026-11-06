// Seed sample categories and stories: pnpm seed
// Safe to re-run: existing categories/stories (by slug) are skipped.
import { getPayload } from 'payload'
import config from '@payload-config'
import { toSlug } from '../src/collections/News'
import { type Block, CATEGORIES, STORIES } from './seed-stories'

const text = (t: string) => ({
  type: 'text',
  text: t,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

const lexical = (blocks: Block[]) => ({
  root: {
    ...base,
    type: 'root',
    children: blocks.map((b) => {
      if ('h2' in b) return { ...base, type: 'heading', tag: 'h2', children: [text(b.h2)] }
      if ('quote' in b) return { ...base, type: 'quote', children: [text(b.quote)] }
      if ('ul' in b)
        return {
          ...base,
          type: 'list',
          listType: 'bullet',
          tag: 'ul',
          start: 1,
          children: b.ul.map((item, i) => ({
            ...base,
            type: 'listitem',
            value: i + 1,
            children: [text(item)],
          })),
        }
      return { ...base, type: 'paragraph', textFormat: 0, children: [text(b.p)] }
    }),
  },
})

const payload = await getPayload({ config })

const author = (await payload.find({ collection: 'users', limit: 1, depth: 0 })).docs[0]

const categoryIds: Record<string, number> = {}
for (const name of CATEGORIES) {
  const slug = toSlug(name)
  const existing = (await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1 })).docs[0]
  const doc = existing ?? (await payload.create({ collection: 'categories', data: { name, slug } }))
  categoryIds[name] = doc.id
  payload.logger.info(`${existing ? 'exists ' : 'created'} category ${name}`)
}

for (const s of STORIES) {
  const slug = toSlug(s.title)
  const exists = (await payload.find({ collection: 'news', where: { slug: { equals: slug } }, limit: 1, draft: true })).docs[0]
  if (exists) {
    // SEED_UPDATE=1 pnpm seed: refresh the body of existing sample stories (keeps cover, category, author)
    if (process.env.SEED_UPDATE) {
      await payload.update({
        collection: 'news',
        id: exists.id,
        data: { content: lexical(s.body) as never, _status: 'published' },
      })
      payload.logger.info(`updated story ${slug}`)
    } else {
      payload.logger.info(`exists  story ${slug}`)
    }
    continue
  }

  const res = await fetch(`https://picsum.photos/id/${s.photo.id}/1600/1000`)
  if (!res.ok) throw new Error(`Photo ${s.photo.id} failed: ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())
  const media = await payload.create({
    collection: 'media',
    data: { alt: s.photo.alt },
    file: { data, mimetype: 'image/jpeg', name: `${slug}.jpg`, size: data.length },
  })

  await payload.create({
    collection: 'news',
    data: {
      title: s.title,
      slug,
      category: categoryIds[s.category],
      cover: media.id,
      author: author?.id,
      content: lexical(s.body) as never,
      _status: 'published',
    },
  })
  payload.logger.info(`created story ${slug}`)
}

process.exit(0)
