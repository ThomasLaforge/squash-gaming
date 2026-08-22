import { expect, test } from '@playwright/test';

test.describe('Laboratoire physique M1', () => {
  test('s’ouvre sans erreur et met le court au premier plan', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Squash Gaming' })).toBeVisible();
    await expect(page.getByTestId('physics-scene')).toBeVisible();
    await expect(page.getByTestId('scenario-select')).toBeVisible();
    await expect(page.getByTestId('status')).toHaveCount(0);
    await expect(page.getByTestId('theme-glass')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('theme-indoor').click();
    await expect(page.getByTestId('theme-indoor')).toHaveAttribute('aria-pressed', 'true');
    await expect(errors).toEqual([]);
  });

  test('la balle évolue au pas fixe et rencontre le sol', async ({ page }) => {
    await page.goto('/');
    await expect
      .poll(async () => (await readTick(page)) > 0)
      .toBe(true);

    await expect
      .poll(async () => readPosition(await page.getByTestId('position').textContent()).z < 0.9)
      .toBe(true);

    await expect
      .poll(async () => /IMPACT|SECOND_REBOND/.test((await page.getByTestId('last-event').textContent()) ?? ''))
      .toBe(true);
  });

  test('Pause fige le tick et Reprendre le relance', async ({ page }) => {
    await page.goto('/');
    await expect.poll(async () => (await readTick(page)) > 0).toBe(true);

    await page.getByTestId('pause-toggle').click();
    const frozen = await readTick(page);
    await page.waitForTimeout(300);
    expect(await readTick(page)).toBe(frozen);

    await page.getByTestId('pause-toggle').click();
    await expect.poll(async () => (await readTick(page)) > frozen).toBe(true);
  });

  test('un scénario peut être sélectionné et réinitialisé', async ({ page }) => {
    await page.goto('/');
    await expect.poll(async () => (await readTick(page)) > 0).toBe(true);
    await page.getByTestId('pause-toggle').click();

    await page.getByTestId('scenario-select').selectOption('front-wall');

    await expect(page.getByTestId('scenario-description')).toContainText('mur frontal');
    await expect(page.getByTestId('position')).toContainText('x = 5.000');
  });

  test('les réglages de caméra déplacent la vue', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('camera-height-value')).toHaveText('5.0 m');
    await expect(page.getByTestId('camera-distance-value')).toHaveText('6.1 m');

    await page.getByTestId('camera-height-raiser').click();
    await page.getByTestId('camera-distance-closer').click();

    await expect(page.getByTestId('camera-height-value')).toHaveText('5.6 m');
    await expect(page.getByTestId('camera-distance-value')).toHaveText('5.3 m');
  });

  test('Reset restaure exactement la position initiale', async ({ page }) => {
    await page.goto('/');
    await expect.poll(async () => (await readTick(page)) > 0).toBe(true);
    await page.getByTestId('pause-toggle').click();
    await page.getByTestId('reset').click();

    await expect.poll(async () => readPosition(await page.getByTestId('position').textContent())).toEqual({
      x: 3,
      y: 0,
      z: 1
    });
  });
});

async function readTick(page: import('@playwright/test').Page): Promise<number> {
  const text = (await page.getByTestId('tick').textContent()) ?? '';
  const match = /(\d+)/.exec(text);
  return match ? Number(match[1]) : 0;
}

function readPosition(text: string | null | undefined): { x: number; y: number; z: number } {
  const match = /x = ([-\d.]+) · y = ([-\d.]+) · z = ([-\d.]+)/.exec(text ?? '');
  return match
    ? { x: Number(match[1]), y: Number(match[2]), z: Number(match[3]) }
    : { x: NaN, y: NaN, z: NaN };
}
