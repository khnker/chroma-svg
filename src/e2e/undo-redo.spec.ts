// @ts-nocheck
import { test, expect } from '@playwright/test'

test('undo-redo: change color, Ctrl+Z undo, Ctrl+Shift+Z redo', async ({ page }) => {
  await page.goto('/')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="red" width="100" height="100"/></svg>'),
  })
  await page.getByRole('button', { name: '#ff0000' }).first().click()
  const colorInput = page.locator('input[type="color"], input[value*="#"]')
  await colorInput.fill('#00ff00')

  await page.keyboard.press('Control+Z')
  await expect(page.getByRole('button', { name: /#ff0000/ }).first()).toBeVisible()

  await page.keyboard.press('Control+Shift+Z')
  await expect(page.getByRole('button', { name: /#00ff00/ }).first()).toBeVisible()
})
