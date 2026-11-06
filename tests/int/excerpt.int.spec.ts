import { describe, expect, it } from 'vitest'
import { excerpt } from '@/app/(frontend)/excerpt'

const doc = (...paras: string[][]) => ({
  root: { children: paras.map((p) => ({ children: p.map((text) => ({ text })) })) },
})

describe('excerpt', () => {
  it('joins text nodes inside a paragraph without extra spaces', () => {
    expect(excerpt(doc(['Xin ', 'chào'], ['thế giới']))).toBe('Xin chào thế giới')
  })
  it('cuts at a word boundary', () => {
    expect(excerpt(doc(['một hai ba bốn']), 9)).toBe('một hai…')
  })
  it('handles empty content', () => {
    expect(excerpt(null)).toBe('')
  })
})
