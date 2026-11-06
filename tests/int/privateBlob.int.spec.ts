import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  BlobNotFoundError: class BlobNotFoundError extends Error {},
  del: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))
vi.mock('@payloadcms/plugin-cloud-storage/utilities', () => ({
  getStorageFilePath: vi.fn(async ({ filename }: { filename: string }) => filename),
}))

import { get, put } from '@vercel/blob'
import { privateBlobAdapter } from '@/storage/privateBlob'

const adapter = privateBlobAdapter('tok')({ collection: { slug: 'media' } as never })
const req = (headers: Record<string, string> = {}) =>
  ({ headers: new Headers(headers), payload: { logger: { error: vi.fn() } } }) as never
const blob = { etag: '"e1"', contentType: 'image/jpeg', size: 3 }

describe('privateBlobAdapter', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploads as private', async () => {
    const file = { buffer: Buffer.from('abc'), mimeType: 'image/jpeg' }
    await adapter.handleUpload({ file, storageFilePath: 'a.jpg' } as never)
    expect(put).toHaveBeenCalledWith(
      'a.jpg',
      file.buffer,
      expect.objectContaining({ access: 'private', token: 'tok' }),
    )
  })

  it('streams the file with type, length and etag', async () => {
    vi.mocked(get).mockResolvedValue({
      statusCode: 200,
      stream: new Response('abc').body,
      blob,
    } as never)
    const res = await adapter.staticHandler(req(), {
      params: { filename: 'a.jpg', collection: 'media' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/jpeg')
    expect(res.headers.get('etag')).toBe('"e1"')
    expect(await res.text()).toBe('abc')
  })

  it('passes If-None-Match through and returns 304', async () => {
    vi.mocked(get).mockResolvedValue({ statusCode: 304, stream: null, blob } as never)
    const res = await adapter.staticHandler(req({ 'if-none-match': '"e1"' }), {
      params: { filename: 'a.jpg', collection: 'media' },
    })
    expect(get).toHaveBeenCalledWith(
      'a.jpg',
      expect.objectContaining({ access: 'private', ifNoneMatch: '"e1"' }),
    )
    expect(res.status).toBe(304)
  })

  it('returns 404 when the blob is missing', async () => {
    vi.mocked(get).mockResolvedValue(null)
    const res = await adapter.staticHandler(req(), {
      params: { filename: 'x.jpg', collection: 'media' },
    })
    expect(res.status).toBe(404)
  })
})
