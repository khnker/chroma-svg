import { isLightColor } from '@/lib/color-utils'

export interface ComponentPreviewProps {
  primary: string
  secondary: string
  accent: string
}

export function textColor(bg: string): string {
  return isLightColor(bg) ? '#1f2937' : '#ffffff'
}
