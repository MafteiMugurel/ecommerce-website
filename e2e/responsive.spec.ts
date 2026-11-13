import { expect, searchInput, test, waitForProducts } from './fixtures'

// Rulează în proiectul `mobile-chromium` (Pixel 7) – vezi playwright.config.ts.
test.describe('Mobil', () => {
  test('header-ul, căutarea și meniul funcționează pe ecran mic', async ({ page }) => {
    await page.goto('/')
    await waitForProducts(page)

    // Fără scroll orizontal
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)

    // Căutarea de sub header
    await searchInput(page).fill('ssd')
    await searchInput(page).press('Enter')
    await expect(page).toHaveURL(/\/cautare\?q=ssd/)
    await waitForProducts(page)

    // Meniul lateral
    await page.getByRole('button', { name: 'Deschide meniul de categorii' }).click()
    await page.getByRole('dialog', { name: 'Categorii' }).getByRole('link', { name: 'Contact' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible()
  })
})
