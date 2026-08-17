import { renderTemplate } from '@/lib/templates/render'
import type { LinkTarget, SmsBlock, SmsDocument } from './types'
import type { RenderContext } from './context'

function resolveUrl(target: LinkTarget, custom: string | undefined, ctx: RenderContext): string {
  if (target === 'custom') return custom?.trim() || ''
  return ctx.urls[target] ?? ''
}
function renderBlock(block: SmsBlock, ctx: RenderContext): string {
  switch (block.type) {
    case 'textLine': return renderTemplate(block.text, ctx.tokens)
    case 'linkLine': return resolveUrl(block.target, block.url, ctx)
    case 'blankLine': return ''
  }
}
export function renderSmsDocument(doc: SmsDocument, ctx: RenderContext): string {
  return doc.blocks.map(b => renderBlock(b, ctx)).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
export function smsSegmentCount(body: string): number {
  return Math.max(1, Math.ceil(body.length / 160))
}
