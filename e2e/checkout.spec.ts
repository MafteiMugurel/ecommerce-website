import { expect, test } from './fixtures'

// Testul parcurge pasul de checkout fără să trimită comanda validă:
// „Plasează comanda” ar scrie un document real în colecția `orders`.
test.describe('Checkout', () => {
  test('coș → livrare și plată: validare, selector de plată și sumar', async ({ page }) => {
    await page.goto('/produs/p040') // Stick USB SanDisk Ultra
    await page.getByRole('button', { name: 'Adaugă în coș' }).first().click()

    const cart = page.getByRole('dialog', { name: 'Coș de cumpărături' })
    await cart.getByRole('button', { name: 'Finalizează comanda' }).click()

    await expect(page).toHaveURL(/\/finalizare-comanda$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Finalizare comandă' })).toBeVisible()
    await expect(page.getByText('Livrare și plată')).toHaveAttribute('aria-current', 'step')

    // Sumarul conține produsul din coș
    const summary = page.getByRole('complementary', { name: 'Sumarul comenzii' })
    await expect(summary).toContainText('SanDisk Ultra')

    // Trimiterea formularului gol afișează erorile de validare
    await page.getByRole('button', { name: 'Plasează comanda' }).click()
    await expect(page.getByText('Introdu numele complet.')).toBeVisible()
    await expect(page.getByText('Alege județul.')).toBeVisible()
    await expect(page).toHaveURL(/\/finalizare-comanda$/)

    // Completarea câmpurilor șterge erorile pe loc
    // (etichetele încep cu numele câmpului; după validare conțin și mesajul de eroare)
    await page.getByLabel(/^Nume și prenume/).fill('Test E2E')
    await page.getByLabel(/^Telefon/).fill('0722 123 456')
    await page.getByLabel(/^Email/).fill('e2e@example.com')
    await page.getByLabel(/^Județ/).selectOption('Cluj')
    await page.getByLabel(/^Localitate/).fill('Cluj-Napoca')
    await page.getByLabel(/^Adresă/).fill('Str. Exemplu nr. 1')
    await expect(page.getByText('Introdu numele complet.')).toHaveCount(0)
    await expect(page.getByText('Alege județul.')).toHaveCount(0)

    // Selectorul de plată: implicit card online, se poate alege rambursul
    await expect(page.getByRole('radio', { name: /Card online/ })).toBeChecked()
    await page.getByRole('radio', { name: /Ramburs/ }).check()
    await expect(page.getByRole('radio', { name: /Ramburs/ })).toBeChecked()
    await expect(page.getByRole('radio', { name: /Card online/ })).not.toBeChecked()
  })

  test('checkout cu coșul gol afișează un mesaj', async ({ page }) => {
    await page.goto('/finalizare-comanda')
    await expect(page.getByText('Coșul este gol. Adaugă produse înainte de a finaliza comanda.')).toBeVisible()
  })
})
