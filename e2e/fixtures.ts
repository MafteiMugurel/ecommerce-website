import { test as base, expect, type Page } from '@playwright/test'

/**
 * Fixture comun: fiecare test pornește cu limba română, tema luminoasă
 * și fără coș / favorite salvate, ca rezultatele să nu depindă de rulări anterioare.
 */
export const test = base.extend({
  // al doilea argument (în docs Playwright: `use`) predă pagina testului; redenumit ca linterul React să nu-l confunde cu un hook
  page: async ({ page }, provide) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('e2e-initialized')) return // păstrăm starea la reload în același test
      sessionStorage.setItem('e2e-initialized', '1')
      localStorage.clear()
      localStorage.setItem('language', 'ro')
      localStorage.setItem('theme', 'light')
    })
    await provide(page)
  },
})

export { expect }

/** Câmpul de căutare vizibil (pe desktop e în header, pe mobil sub header). */
export function searchInput(page: Page) {
  return page.locator('input[type="search"]:visible').first()
}

/** Așteaptă încărcarea listei de produse (dispare mesajul de încărcare). */
export async function waitForProducts(page: Page) {
  await expect(page.getByRole('article').first()).toBeVisible()
}
