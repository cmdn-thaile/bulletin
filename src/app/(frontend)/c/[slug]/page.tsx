import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import FrontPage from '../../FrontPage'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (!docs[0]) notFound()
  return <FrontPage category={docs[0]} />
}
