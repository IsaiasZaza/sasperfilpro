import { expect, test } from "@playwright/test";
import { ATMOSPHERE_IDS, themeFromApi, themeSnapshot, themeToApi } from "../lib/theme";

/**
 * QA do contrato de tema + atmosphere.
 * Roda sem browser: npx playwright test e2e/theme-atmosphere.spec.ts
 */
test.describe("theme atmosphere contract", () => {
  test("themeToApi só emite campos do contrato (inclui atmosphere)", () => {
    const wire = themeToApi({
      backgroundColor: "#050805",
      textColor: "#e8ffe8",
      primaryColor: "#39ff14",
      buttonStyle: "square",
      font: "mono",
      atmosphere: "claw",
    });

    expect(wire).toEqual({
      primaryColor: "#39ff14",
      backgroundColor: "#050805",
      textColor: "#e8ffe8",
      buttonStyle: "square",
      font: "mono",
      atmosphere: "claw",
    });
    expect(Object.keys(wire!).sort()).toEqual([
      "atmosphere",
      "backgroundColor",
      "buttonStyle",
      "font",
      "primaryColor",
      "textColor",
    ]);
  });

  test("round-trip API preserva atmosphere", () => {
    for (const atmosphere of ATMOSPHERE_IDS) {
      const sent = themeToApi({
        backgroundColor: "#0a0e1a",
        textColor: "#ffffff",
        primaryColor: "#e62429",
        buttonStyle: "pill",
        font: "sans",
        atmosphere,
      });
      const loaded = themeFromApi(sent);
      expect(themeSnapshot(loaded)).toBe(themeSnapshot(sent));
      expect(themeToApi(loaded)?.atmosphere).toBe(atmosphere);
    }
  });

  test("snapshot estável (idempotente) — evita loop de Salvando", () => {
    const a = themeToApi({
      backgroundColor: "#080612",
      textColor: "#fce7f3",
      primaryColor: "#ff2d95",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "cosmic",
    });
    const b = themeToApi(themeFromApi(a));
    const c = themeToApi(themeFromApi(b));
    expect(themeSnapshot(a)).toBe(themeSnapshot(b));
    expect(themeSnapshot(b)).toBe(themeSnapshot(c));
  });

  test("atmosphere inválido vira none", () => {
    const wire = themeToApi({
      backgroundColor: "#111111",
      textColor: "#ffffff",
      primaryColor: "#ffffff",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "nao-existe" as never,
    });
    expect(wire?.atmosphere).toBe("none");
  });
});
