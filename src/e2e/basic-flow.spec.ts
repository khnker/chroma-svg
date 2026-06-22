// @ts-nocheck
import { test, expect } from '@playwright/test'

test('basic flow: upload SVG, see colors, change color, download', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'),
  })
  await expect(page.locator('text=#ff0000')).toBeVisible()
  await page.locator('text=#ff0000').click()
  const colorInput = page.locator('input[type="color"], input[value*="#"]')
  await colorInput.fill('#00ff00')
  const downloadBtn = page.locator('button:has-text("Download")')
  await expect(downloadBtn).toBeEnabled()
})
