// @ts-nocheck
import { test, expect } from '@playwright/test'

test('multi-svg: load 2 SVGs, switch tabs, verify independent state', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'first.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'),
  })
  await fileInput.setInputFiles({
    name: 'second.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle fill="blue" cx="50" cy="50" r="40"/></svg>'),
  })
  const tab1 = page.locator('button:has-text("first.svg")')
  const tab2 = page.locator('button:has-text("second.svg")')
  await expect(tab1).toBeVisible()
  await expect(tab2).toBeVisible()
  await tab2.click()
  await expect(page.locator('text=#0000ff')).toBeVisible()
})
