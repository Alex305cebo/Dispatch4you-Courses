import { test, expect } from '@playwright/test';

test('interactive feedback pulse effect works', async ({ page }) => {
  // Start the server
  await page.goto('http://localhost:8080/index.html');

  // Find a button (e.g., in the hero section or a benefit card)
  const button = page.locator('button').first();
  await expect(button).toBeVisible();

  // Perform mousedown and check for the "clicking" class
  await page.mouse.move(
    (await button.boundingBox())!.x + 10,
    (await button.boundingBox())!.y + 10
  );
  await page.mouse.down();

  // Check if class is added
  const hasClass = await button.evaluate(el => el.classList.contains('clicking'));
  console.log(`Button has "clicking" class on mousedown: ${hasClass}`);

  // Take a screenshot
  await page.screenshot({ path: 'verification/mousedown.png' });

  await page.mouse.up();

  // Wait a bit for the timeout to remove the class
  await page.waitForTimeout(400);
  const hasClassAfter = await button.evaluate(el => el.classList.contains('clicking'));
  console.log(`Button has "clicking" class after mouseup: ${hasClassAfter}`);

  await page.screenshot({ path: 'verification/mouseup.png' });

  // Test a dynamic element
  await page.evaluate(() => {
    const btn = document.createElement('button');
    btn.id = 'dynamic-btn';
    btn.textContent = 'Dynamic Button';
    document.body.appendChild(btn);
  });

  const dynamicBtn = page.locator('#dynamic-btn');
  await dynamicBtn.scrollIntoViewIfNeeded();

  await page.mouse.move(
    (await dynamicBtn.boundingBox())!.x + 10,
    (await dynamicBtn.boundingBox())!.y + 10
  );
  await page.mouse.down();

  const hasClassDynamic = await dynamicBtn.evaluate(el => el.classList.contains('clicking'));
  console.log(`Dynamic button has "clicking" class on mousedown: ${hasClassDynamic}`);

  await page.screenshot({ path: 'verification/dynamic_mousedown.png' });

  await page.mouse.up();

  expect(hasClass).toBe(true);
  expect(hasClassDynamic).toBe(true);
});
