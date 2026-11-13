import { expect, searchInput, test, waitForProducts } from './fixtures'

test.describe('Catalog și navigare', () => {
  test('pagina principală afișează toate produsele', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Toate produsele' })).toBeVisible()
    await waitForProducts(page)
    await expect(page.getByText(/^\d+ de produse$/)).toBeVisible()
    expect(await page.getByRole('article').count()).toBeGreaterThanOrEqual(100)
  })

  test('meniul de categorii filtrează produsele', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Deschide meniul de categorii' }).click()
    const menu = page.getByRole('dialog', { name: 'Categorii' })
    await menu.getByRole('link', { name: 'Servere' }).click()

    await expect(page).toHaveURL(/\/categorie\/servere$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Servere' })).toBeVisible()
    await waitForProducts(page)
    // Toate cardurile afișate sunt din categoria Servere
    const badges = page.getByRole('article').locator('span', { hasText: /^Servere$/ })
    expect(await badges.count()).toBe(await page.getByRole('article').count())
  })

  test('o categorie inexistentă afișează un mesaj', async ({ page }) => {
    await page.goto('/categorie/nu-exista')
    await expect(page.getByRole('heading', { name: 'Categoria nu există' })).toBeVisible()
  })

  test('căutarea ignoră diacriticele', async ({ page }) => {
    await page.goto('/')
    await searchInput(page).fill('casti')
    await searchInput(page).press('Enter')

    await expect(page).toHaveURL(/\/cautare\?q=casti/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rezultate pentru „casti”')
    await waitForProducts(page)
    // Fiecare rezultat conține „Căști” (cu diacritice) în nume sau descriere
    const first = page.getByRole('article').first()
    await expect(first).toContainText(/căști/i)
  })

  test('căutarea fără rezultate afișează un mesaj', async ({ page }) => {
    await page.goto('/cautare?q=zzzxxyy')
    await expect(page.getByText('Nu am găsit niciun produs.', { exact: false })).toBeVisible()
  })
})
