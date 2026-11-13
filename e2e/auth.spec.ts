import { expect, test } from './fixtures'

test.describe('Autentificare și acces', () => {
  test('paginile protejate trimit vizitatorul la autentificare', async ({ page }) => {
    await page.goto('/comenzile-mele')
    await expect(page).toHaveURL(/\/autentificare$/)
    await expect(page.getByRole('heading', { name: 'Intră în cont' })).toBeVisible()

    await page.goto('/admin/produse')
    await expect(page).toHaveURL(/\/autentificare$/)
  })

  test('validarea formularului de creare cont', async ({ page }) => {
    await page.goto('/cont-nou')
    await page.getByLabel('Nume').fill('Test E2E')
    await page.getByLabel('Email').fill('e2e@example.com')
    // eticheta include și textul ajutător („Minim 6 caractere.”)
    await page.getByLabel(/^Parolă/).fill('parola123')
    await page.getByLabel('Confirmă parola').fill('altaparola')
    await page.getByRole('button', { name: 'Creează cont' }).click()
    await expect(page.getByRole('alert')).toHaveText('Parolele nu coincid.')
  })

  test('credențialele greșite afișează o eroare', async ({ page }) => {
    await page.goto('/autentificare')
    await page.getByLabel('Email').fill('nu-exista-e2e@example.com')
    await page.getByLabel('Parolă').fill('parola-gresita')
    await page.getByRole('button', { name: 'Intră în cont', exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText('Email sau parolă incorectă.')
  })

  // Rulează doar dacă sunt setate credențialele unui cont de test (nu se salvează în cod):
  //   E2E_USER_EMAIL=... E2E_USER_PASSWORD=... npm run test:e2e
  test('utilizatorul de test se autentifică, vede comenzile și se deconectează', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL
    const password = process.env.E2E_USER_PASSWORD
    test.skip(!email || !password, 'Setează E2E_USER_EMAIL și E2E_USER_PASSWORD pentru acest test')

    await page.goto('/comenzile-mele')
    await page.getByLabel('Email').fill(email!)
    await page.getByLabel('Parolă').fill(password!)
    await page.getByRole('button', { name: 'Intră în cont', exact: true }).click()

    // Revine pe pagina cerută inițial
    await expect(page).toHaveURL(/\/comenzile-mele$/)
    await expect(page.getByRole('heading', { name: 'Comenzile mele' })).toBeVisible()

    await page.getByRole('button', { name: /^Contul meu/ }).click()
    await page.getByRole('menuitem', { name: 'Deconectare' }).click()
    await expect(page.getByRole('link', { name: 'Intră în cont' })).toBeVisible()
  })
})
