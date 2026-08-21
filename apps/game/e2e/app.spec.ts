import { expect, test } from '@playwright/test';

test.describe('App minimale', () => {
  test('s’ouvre sans erreur et affiche le statut bootstrap', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /squash gaming/i })).toBeVisible();
    const status = page.getByTestId('status');
    await expect(status).toBeVisible();
    // Toutes les briques installées au M0 doivent être signalées OK.
    const lines = await status.locator('div').allTextContents();
    expect(lines.some((line) => line.includes('installed'))).toBe(true);
    expect(lines.some((line) => line.includes('simulationHeadless'))).toBe(true);

    await expect(errors).toEqual([]);
  });

  test('le tick de simulation avance au chargement (pas fixe)', async ({ page }) => {
    await page.goto('/');
    // Le compteur tick doit progresser dès que l'app tourne.
    await expect
      .poll(async () => {
        const text = (await page.getByTestId('tick').textContent()) ?? '';
        const match = /tick = (\d+)/.exec(text);
        return match ? Number(match[1]) : 0;
      })
      .toBeGreaterThan(0);
  });

  test('WASD fait avancer le personnage trivial', async ({ page }) => {
    await page.goto('/');
    // Attend que la simulation soit en marche.
    await expect
      .poll(async () => {
        const text = (await page.getByTestId('tick').textContent()) ?? '';
        const match = /tick = (\d+)/.exec(text);
        return match ? Number(match[1]) : 0;
      })
      .toBeGreaterThan(0);

    const before = readPosition(await page.getByTestId('position').textContent());
    await page.keyboard.press('KeyD');
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');
    const after = readPosition(await page.getByTestId('position').textContent());
    // Mouvement positif en X (droite) : la position change.
    expect(after.x).toBeGreaterThan(before.x);
  });

  test('Pause fige le tick, Reprendre le relance', async ({ page }) => {
    await page.goto('/');
    await expect
      .poll(async () => {
        const text = (await page.getByTestId('tick').textContent()) ?? '';
        const match = /tick = (\d+)/.exec(text);
        return match ? Number(match[1]) : 0;
      })
      .toBeGreaterThan(0);

    await page.getByTestId('pause-toggle').click();
    const frozen = await readTick(page);
    await page.waitForTimeout(400);
    const afterPause = await readTick(page);
    expect(afterPause).toBe(frozen);

    await page.getByTestId('pause-toggle').click();
    await expect
      .poll(async () => (await readTick(page)) > afterPause)
      .toBe(true);
  });

  test('Reset remet la position à zéro', async ({ page }) => {
    await page.goto('/');
    // D’abord, déplacer le personnage pour qu’il parte de 0.
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(500);
    await page.keyboard.up('KeyD');
    const moved = readPosition(await page.getByTestId('position').textContent());
    expect(moved.x).toBeGreaterThan(0);

    // Reset : la position revient exactement à 0.
    await page.getByTestId('reset').click();
    await expect
      .poll(async () => {
        const pos = readPosition(await page.getByTestId('position').textContent());
        return Math.abs(pos.x) < 0.001 && Math.abs(pos.y) < 0.001;
      })
      .toBe(true);
  });
});

async function readTick(page: import('@playwright/test').Page): Promise<number> {
  const text = (await page.getByTestId('tick').textContent()) ?? '';
  const match = /tick = (\d+)/.exec(text);
  return match ? Number(match[1]) : 0;
}

function readPosition(text: string | null | undefined): { x: number; y: number } {
  const match = /x = ([-\d.]+) · y = ([-\d.]+)/.exec(text ?? '');
  return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: NaN, y: NaN };
}
