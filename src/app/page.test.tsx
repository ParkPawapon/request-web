import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import Home from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Home", () => {
  it("renders the migrated login shell", () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole("heading", { name: /ระบบยื่นคำร้อง/u }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /เข้าสู่ระบบด้วย KMUTT Account/u }),
    ).toBeInTheDocument();
  });
});
