import { describe, expect, it, vi } from "vitest";

const mockGetDb = vi.hoisted(() => vi.fn());

vi.mock("@agent-native/core/server", () => ({
  getAppBasePath: () => "",
}));

vi.mock("../db/index.js", () => ({
  getDb: () => mockGetDb(),
  schema: { forms: { id: "forms.id", slug: "forms.slug" } },
}));

import { renderPublicFormHtml } from "./public-form-ssr";

describe("public form document language", () => {
  it("declares Spanish for a published form authored in Spanish", async () => {
    const form = {
      id: "form-spanish-language",
      slug: "contacto-espanol",
      title: "Formulario de contacto",
      description: "Cuéntanos cómo podemos ayudarte.",
      fields: JSON.stringify([
        {
          id: "name",
          type: "text",
          label: "Nombre completo",
          placeholder: "Escribe tu nombre",
          required: true,
        },
      ]),
      settings: JSON.stringify({
        submitText: "Enviar respuesta",
        successMessage: "Gracias. Hemos recibido tu respuesta.",
      }),
      status: "published",
      deletedAt: null,
    };
    mockGetDb.mockReturnValue({
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([form]),
        }),
      }),
    });

    const { html, status } = await renderPublicFormHtml("/f/contacto-espanol");

    expect(status).toBe(200);
    expect(html).toContain("Nombre completo");
    expect(html).toContain("Enviar respuesta");
    expect(html).toContain("Gracias. Hemos recibido tu respuesta.");
    expect(html.match(/<html\b[^>]*\blang="([^"]+)"/)?.[1]).toBe("es");
  });
});
