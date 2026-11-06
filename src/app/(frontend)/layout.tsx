import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import './styles.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  description: 'The latest news, updated daily.',
  title: 'The Bulletin',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const today = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())
  const payload = await getPayload({ config })
  const { docs: categories } = await payload.find({
    collection: 'categories',
    sort: 'name',
    limit: 12,
    pagination: false,
  })

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-head">
          <div className="wrap utility">
            <span>{today}</span>
            <a href="/admin">Write a story</a>
          </div>
          <div className="wrap">
            <Link href="/" className="wordmark">
              The Bulletin
            </Link>
          </div>
          <nav className="wrap sections" aria-label="Sections">
            <Link href="/">Home</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`}>
                {c.name}
              </Link>
            ))}
          </nav>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-foot">
          <div className="wrap">
            <Link href="/" className="wordmark small">
              The Bulletin
            </Link>
            <p>© {new Date().getFullYear()} The Bulletin. A demo news site built with Payload CMS and Next.js.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
