// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { extractInlineStyles, buildCssSelector } from '../../core/dom-traversal'

describe('extractInlineStyles', () => {
  it('returns style entries for element with fill', () => {
    const div = document.createElement('div')
    div.innerHTML = '<rect fill="red" width="10" height="10"/>'
    const rect = div.firstElementChild!
    const result = extractInlineStyles(rect)
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].attribute).toBe('fill')
    expect(result[0].value).toBe('red')
  })

  it('returns empty array for element without color styles', () => {
    const div = document.createElement('div')
    div.innerHTML = '<rect width="10" height="10"/>'
    const rect = div.firstElementChild!
    const result = extractInlineStyles(rect)
    expect(result).toEqual([])
  })
})

describe('buildCssSelector', () => {
  it('builds a selector path for an element', () => {
    const div = document.createElement('div')
    div.innerHTML = '<svg><g id="layer1"><rect class="shape" fill="red"/></g></svg>'
    const rect = div.querySelector('rect')!
    const selector = buildCssSelector(rect)
    expect(selector).toBeTruthy()
    expect(typeof selector).toBe('string')
  })

  it('returns tag name for root-level element', () => {
    const div = document.createElement('div')
    div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red"/></svg>'
    const rect = div.querySelector('rect')!
    const selector = buildCssSelector(rect)
    expect(selector).toContain('rect')
  })
})
