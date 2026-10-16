import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPreview, type Scenario } from "@/lib/ui/fixtures";

const mocks = vi.hoisted(() => ({ useAppUi: vi.fn() }));
vi.mock("@/components/app/app-shell", () => ({ useAppUi: mocks.useAppUi }));
vi.mock("@/lib/example/actions", () => ({ saveExampleAction: vi.fn(), deleteExampleAction: vi.fn() }));
import { Dashboard } from "@/components/app/dashboard";
import { ExampleList, ExampleDetail } from "@/components/app/example";

function preview(scenario: Scenario) {
  const { examples: previewExamples, ...app } = getPreview(scenario);
  mocks.useAppUi.mockReturnValue({ app, previewExamples, href: (path: string) => path });
}

beforeEach(() => preview("pro-monthly"));

describe("Example presentation after separating live page data", () => {
  it("keeps the three preview resources on Dashboard and the list", () => {
    const dashboard = renderToStaticMarkup(createElement(Dashboard, {}));
    const list = renderToStaticMarkup(createElement(ExampleList, {}));
    for (const resource of getPreview("pro-monthly").examples) {
      expect(dashboard).toContain(resource.title);
      expect(list).toContain(resource.title);
    }
  });

  it("never falls back to fixture resources when a live page supplies an empty list", () => {
    for (const component of [Dashboard, ExampleList]) {
      const html = renderToStaticMarkup(createElement(component, { examples: [] }));
      expect(html).toContain("No Example resources yet");
      expect(html).not.toContain("Make this space your own");
    }
  });

  it("renders supplied summaries without needing full resource content", () => {
    const html = renderToStaticMarkup(createElement(ExampleList, { examples: [{ id: "live", title: "Live resource", updatedAt: "2026-10-01T00:00:00Z" }] }));
    expect(html).toContain("Live resource");
    expect(html).toContain("/app/example/live");
    expect(html).not.toContain("Make this space your own");
  });

  it("preserves retained preview detail and Pro editing", () => {
    preview("retained");
    const retained = renderToStaticMarkup(createElement(ExampleDetail, { id: "first-example" }));
    expect(retained).toContain("Read resource");
    expect(retained).toContain(getPreview("retained").examples[0].content.split("\n")[0]);
    expect(retained).not.toContain("Save resource");
    preview("pro-monthly");
    const editable = renderToStaticMarkup(createElement(ExampleDetail, { id: "first-example" }));
    expect(editable).toContain("Edit resource");
    expect(editable).toContain("Save resource");
  });

  it("keeps an explicitly unavailable live resource unavailable even with preview fixtures", () => {
    const html = renderToStaticMarkup(createElement(ExampleDetail, { id: "first-example", resource: null }));
    expect(html).toContain("Resource unavailable");
    expect(html).not.toContain("Make this space your own");
  });
});
