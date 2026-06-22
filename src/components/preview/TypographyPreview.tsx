import type { ComponentPreviewProps } from './types'

export function TypographyPreview({ primary, secondary }: ComponentPreviewProps) {
  return (
    <div className="space-y-3 max-w-lg">
      <p className="text-xs text-gray-400 mb-1">Typography</p>
      <h1 className="text-2xl font-bold" style={{ color: primary }}>Heading 1</h1>
      <h2 className="text-xl font-semibold" style={{ color: secondary }}>Heading 2</h2>
      <h3 className="text-lg font-medium" style={{ color: primary }}>Heading 3</h3>
      <p className="text-sm text-gray-700">
        Body text with a{' '}
        <a href="#" className="underline" style={{ color: primary }}>
          link
        </a>{' '}
        and <strong>bold</strong> and <em>italic</em> styles.
      </p>
      <p className="text-xs text-gray-400">Caption / muted text</p>
    </div>
  )
}
