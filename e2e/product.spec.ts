import { expect, test } from './fixtures'

test.describe('Pagina de produs', () => {
  test('afișează detaliile, specificațiile, produsele similare și recenziile', async ({ page }) => {
    await page.goto('/produs/p001')

    await expect(page.getByRole('heading', { level: 1, name: 'Procesor AMD Ryzen 7 7800X3D' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Componente PC')

    // Specificații tehnice
    const specs = page.locator('#specificatii')
    await expect(specs.getByRole('heading', { name: 'Specificații tehnice' })).toBeVisible()
    await expect(specs.getByRole('rowheader', { name: 'Socket' })).toBeVisible()
    await expect(specs.getByRole('cell', { name: 'AM5' })).toBeVisible()

    // Produse similare: aceeași categorie, fără produsul curent
    const similar = page.getByRole('heading', { name: 'Produse similare' }).locator('..')
    await expect(similar.getByRole('article')).toHaveCount(4)
    await expect(similar.getByRole('article').filter({ hasText: 'Ryzen 7 7800X3D' })).toHaveCount(0)

    // Recenzii: rezumat + invitație de autentificare pentru vizitatori
    const reviews = page.locator('#recenzii')
    await expect(reviews.getByRole('heading', { name: 'Recenzii' })).toBeVisible()
    await expect(reviews.getByText(/\d+ recenzi/).first()).toBeVisible()
    await expect(reviews.getByText('Trebuie să fii autentificat ca să lași o recenzie.')).toBeVisible()
  })

  test('produsul inexistent afișează un mesaj', async ({ page }) => {
    await page.goto('/produs/nu-exista')
    await expect(page.getByRole('heading', { name: 'Produsul nu există' })).toBeVisible()
  })

  test('produsul fără stoc nu poate fi adăugat în coș', async ({ page }) => {
    await page.goto('/produs/p009') // Keychron K8 Pro – stoc 0 în datele inițiale
    await expect(page.getByText('Stoc epuizat').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Stoc epuizat' })).toBeDisabled()
  })
})
