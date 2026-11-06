import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities'
import { BlobNotFoundError, del, get, put } from '@vercel/blob'

// Vercel Blob adapter for a PRIVATE store (the official @payloadcms/storage-vercel-blob only supports public).
// Files are never exposed by URL: they are streamed through Payload at /api/media/file/<filename>,
// so the collection's `read` access decides who can see them.
// shortcut: uploads go through the server (no client uploads), so Vercel's 4.5MB request body
// limit applies to admin uploads; add a signed client-upload route if larger files are needed.
export const privateBlobAdapter =
  (token: string): Adapter =>
  ({ collection }) => ({
    name: 'vercel-blob-private',

    handleUpload: async ({ file, storageFilePath }) => {
      await put(storageFilePath, file.buffer, {
        access: 'private',
        allowOverwrite: true,
        contentType: file.mimeType,
        token,
      })
    },

    handleDelete: async ({ storageFilePath }) => {
      await del(storageFilePath, { token })
    },

    staticHandler: async (req, { doc, params: { filename } }) => {
      try {
        // Resolves the stored key with an access-checked lookup of the media doc
        const pathname = await getStorageFilePath({ collection, doc, filename, req })
        const ifNoneMatch = req.headers.get('if-none-match') ?? undefined
        const result = await get(pathname, { access: 'private', token, ifNoneMatch })
        if (!result) return new Response(null, { status: 404 })

        const headers = new Headers({
          // Media is publicly readable here; switch to `private` if `read` access gets restricted
          'Cache-Control': 'public, max-age=86400',
          ETag: result.blob.etag,
        })
        if (result.statusCode === 304) return new Response(null, { status: 304, headers })

        headers.set('Content-Type', result.blob.contentType)
        headers.set('Content-Length', String(result.blob.size))
        return new Response(result.stream, { status: 200, headers })
      } catch (err) {
        if (err instanceof BlobNotFoundError) return new Response(null, { status: 404 })
        req.payload.logger.error({ err, msg: 'private blob staticHandler failed' })
        return new Response('Internal Server Error', { status: 500 })
      }
    },
  })
