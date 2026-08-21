import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe("smoke", () => {
  test("login inválido mostra erro", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill("naoexiste@example.com");
    await page.locator("#password").fill("senha-errada-123");
    await page.getByRole("button", { name: /^Entrar$/i }).click();
    await expect(page.getByText(/senha invalid|incorret/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("/app sem cookie redireciona para login", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/login/);
  });

  test("claim username taken bloqueia submit", async ({ page }) => {
    await page.route("**/usernames/check*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            available: false,
            message: "ja esta em uso",
          },
          error: null,
        }),
      });
    });

    await page.goto("/");
    const input = page.getByPlaceholder("seunome").first();
    await input.fill("mariaoliveira");
    await expect(page.getByText(/já está em uso/i).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("button", { name: /Pegar/i }).first(),
    ).toBeDisabled();
  });

  test("/planos?reason=expired mostra banner", async ({ page }) => {
    await page.goto("/planos?reason=expired");
    await expect(
      page.getByText(/assinatura não está ativa|Escolha um plano/i),
    ).toBeVisible();
  });

  test("login válido e logout", async ({ page }) => {
    test.skip(!email || !password, "Defina E2E_EMAIL e E2E_PASSWORD");

    await page.goto("/login");
    await page.locator("#email").fill(email!);
    await page.locator("#password").fill(password!);
    await page.getByRole("button", { name: /^Entrar$/i }).click();
    await expect(page).toHaveURL(/\/(app|onboarding|assinatura)/, {
      timeout: 30_000,
    });

    await page.goto("/app");
    await page.getByRole("button", { name: /Sair/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
