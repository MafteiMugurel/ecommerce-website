import { expect, test, waitForProducts } from './fixtures'

test.describe('Favorite, limbă și temă', () => {
  test('vizitatorul salvează un produs la favorite', async ({ page }) => {
    await page.goto('/')
    await waitForProducts(page)
    const firstCard = page.getByRole('article').first()
    const name = (await firstCard.getByRole('heading').innerText()).trim()

    await firstCard.getByRole('button', { name: 'Adaugă la favorite' }).click()
    await expect(firstCard.getByRole('button', { name: 'Elimină de la favorite' })).toBeVisible()

    await page.getByRole('link', { name: 'Favorite (1)' }).click()
    await expect(page).toHaveURL(/\/favorite$/)
    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(page.getByRole('article')).toContainText(name)
  })

  test('schimbarea limbii traduce interfața și formatul prețurilor', async ({ page }) => {
    await page.goto('/produs/p001')
    await expect(page.getByRole('button', { name: 'Adaugă în coș' }).first()).toBeVisible()
    await expect(page.getByText('1.899,00 RON').first()).toBeVisible()

    await page.getByRole('combobox', { name: 'Limba' }).selectOption('en')

    await expect(page.getByRole('button', { name: 'Add to cart' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Technical specifications' })).toBeVisible()
    await expect(page.getByText('RON 1,899.00').first()).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    // Alegerea se păstrează după reîncărcare
    await page.reload()
    await expect(page.getByRole('button', { name: 'Add to cart' }).first()).toBeVisible()
  })

  test('comutatorul de temă activează modul întunecat', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Comută pe tema întunecată' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: 'Comută pe tema luminoasă' })).toBeVisible()
  })
})
