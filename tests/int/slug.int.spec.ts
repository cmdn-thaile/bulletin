import { describe, it, expect } from 'vitest'
import { toSlug } from '@/collections/News'

describe('toSlug', () => {
  it('bỏ dấu tiếng Việt và nối bằng "-"', () => {
    expect(toSlug('Ra mắt sản phẩm mới')).toBe('ra-mat-san-pham-moi')
    expect(toSlug('  Đà Nẵng: 2026!! ')).toBe('da-nang-2026')
  })
})
