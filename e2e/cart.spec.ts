import { expect, test } from './fixtures'

// Coșul se testează până la butonul „Finalizează comanda”, fără să-l apăsăm:
// plasarea comenzii ar scrie un document real în colecția `orders`.
test.describe('Coș de cumpărături', () => {
  test('adaugă produse cu cantitate, modifică și șterge', async ({ page }) => {
    await page.goto('/produs/p008') // Logitech MX Master 3S

    // Cantitate 2 din pagina de produs → se deschide coșul
    await page.getByRole('button', { name: 'Crește cantitatea' }).click()
    // primul buton e cel din detaliile produsului (următoarele sunt pe cardurile similare)
    await page.getByRole('button', { name: 'Adaugă în coș' }).first().click()

    const cart = page.getByRole('dialog', { name: 'Coș de cumpărături' })
    await expect(cart).toBeVisible()
    await expect(cart).toContainText('Logitech MX Master 3S')
    await expect(cart.getByText('2', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Deschide coșul (2)' })).toBeVisible()

    // Scade la 1
    await cart.getByRole('button', { name: 'Scade cantitatea' }).click()
    await expect(page.getByRole('button', { name: 'Deschide coșul (1)' })).toBeVisible()

    // Ștergere → coș gol
    await cart.getByRole('button', { name: 'Șterge' }).click()
    await expect(cart.getByText('Coșul este gol.')).toBeVisible()
  })

  test('coșul se păstrează după reîncărcarea paginii', async ({ page }) => {
    await page.goto('/produs/p015')
    // primul buton e cel din detaliile produsului (următoarele sunt pe cardurile similare)
    await page.getByRole('button', { name: 'Adaugă în coș' }).first().click()
    await expect(page.getByRole('button', { name: 'Deschide coșul (1)' })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: 'Deschide coșul (1)' })).toBeVisible()
    await page.getByRole('button', { name: 'Deschide coșul (1)' }).click()
    const cart = page.getByRole('dialog', { name: 'Coș de cumpărături' })
    await expect(cart.getByRole('button', { name: 'Finalizează comanda' })).toBeEnabled()
  })

  test('pagina de confirmare nu se poate deschide fără o comandă', async ({ page }) => {
    await page.goto('/comanda-finalizata')
    await expect(page).toHaveURL(/\/$/)
  })
})
