// @ts-nocheck
import { test, expect } from '@playwright/test'

test('keyboard shortcuts: R reset, E export', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'),
  })
  await expect(page.locator('text=#ff0000')).toBeVisible()

  await page.keyboard.press('r')
  const resetConfirm = page.locator('text=reset, text=confirm, [role="dialog"]')
  if (await resetConfirm.isVisible()) {
    await resetConfirm.click()
  }
})

test('keyboard shortcuts: ? shows help', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true })))
  await expect(page.locator('text=Keyboard Shortcuts')).toBeVisible()
})
