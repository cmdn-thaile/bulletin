import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Category, Media, News } from '@/payload-types'
import { excerpt } from './excerpt'

const time = (d: string) =>
  new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'numeric',
  }).format(new Date(d))

function Cover({ post, sizes }: { post: News; sizes: string }) {
  const c = post.cover as Media | null
  if (!c?.url) return null
  return (
    <Link href={`/news/${post.slug}`} className="cover-link" tabIndex={-1} aria-hidden>
      <Image
        className="cover"
        src={c.url}
        alt={c.alt || ''}
        width={c.width || 1600}
        height={c.height || 1000}
        sizes={sizes}
      />
    </Link>
  )
}

function Stamp({ post }: { post: News }) {
  const cat = post.category as Category | null | undefined
  return (
    <p className="stamp">
      {cat?.name && (
        <>
          <Link href={`/c/${cat.slug}`} className="cat">
            {cat.name}
          </Link>
          {' · '}
        </>
      )}
      {time(post.createdAt)}
    </p>
  )
}

// Bố cục trang nhất kiểu báo giấy: bài chính + ảnh, cột "Mới nhất", hàng bài phụ bên dưới.
// Có category → chỉ lấy bài của chuyên mục đó, tên chuyên mục làm h1.
export default async function FrontPage({ category }: { category?: Category }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: {
      _status: { equals: 'published' },
      ...(category && { category: { equals: category.id } }),
    },
    sort: '-createdAt',
    depth: 1,
    limit: 20,
  })

  const Lead = category ? 'h2' : 'h1'
  const heading = category && <h1 className="cat-head">{category.name}</h1>

  if (!docs.length) {
    return (
      <section className="empty">
        {heading}
        <Lead>No stories yet</Lead>
        <p>
          Head to the <a href="/admin/collections/news/create">admin panel</a> to write and publish the first one.
        </p>
      </section>
    )
  }

  const [lead, ...rest] = docs
  const secondary = rest.slice(0, 2)
  const grid = rest.slice(2, 10)
  // Mỗi cột là trọn một bài: bài chính (kèm ảnh của nó) | bài phụ | Mới nhất.
  // Chỉ 1 bài: không có cột phụ và "Mới nhất" (chỉ lặp lại bài chính).
  const solo = docs.length === 1

  return (
    <>
      {heading}
      <div className={solo ? 'front solo' : 'front'}>
        <article className="lead">
          <Cover
            post={lead}
            sizes={solo ? '(max-width: 700px) 100vw, 60vw' : '(max-width: 700px) 100vw, 45vw'}
          />
          <div className="lead-text">
            <Lead>
              <Link href={`/news/${lead.slug}`}>{lead.title}</Link>
            </Lead>
            {excerpt(lead.content) && <p className="dek">{excerpt(lead.content)}</p>}
            <Stamp post={lead} />
          </div>
        </article>

        {secondary.length > 0 && (
          <div className="secondary">
            {secondary.map((p) => (
              <article key={p.id} className="story-sm">
                <Cover post={p} sizes="(max-width: 700px) 100vw, 25vw" />
                <h2>
                  <Link href={`/news/${p.slug}`}>{p.title}</Link>
                </h2>
                {excerpt(p.content) && <p>{excerpt(p.content, 120)}</p>}
              </article>
            ))}
          </div>
        )}

        {!solo && (
          <aside className="latest">
            <h2>Latest</h2>
            <ol>
              {docs.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <time dateTime={p.createdAt}>{time(p.createdAt)}</time>
                  <Link href={`/news/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>

      {grid.length > 0 && (
        <section className="more">
          <h2 className="rule-head">More news</h2>
          <div className="more-grid">
            {grid.map((p) => (
              <article key={p.id} className="story-sm">
                <Cover post={p} sizes="(max-width: 900px) 100vw, 25vw" />
                <h3>
                  <Link href={`/news/${p.slug}`}>{p.title}</Link>
                </h3>
                {excerpt(p.content) && <p>{excerpt(p.content, 120)}</p>}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
