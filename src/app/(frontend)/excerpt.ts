type LexNode = { type?: string; text?: string; children?: LexNode[] }

// Lấy đoạn tóm tắt dạng chữ thuần từ nội dung Lexical
export const excerpt = (content: unknown, max = 200): string => {
  const blocks: string[] = []
  const walk = (n: LexNode, out: string[]) => {
    if (n.text) out.push(n.text)
    n.children?.forEach((c) => walk(c, out))
  }
  for (const block of (content as { root?: LexNode } | null)?.root?.children ?? []) {
    const out: string[] = []
    walk(block, out)
    blocks.push(out.join(''))
  }
  const text = blocks.join(' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text
}
