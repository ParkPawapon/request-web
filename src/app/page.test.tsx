import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import Home from "./page";

describe("Home", () => {
  it("renders the foundation shell", () => {
    renderWithProviders(<Home />);

    expect(
      screen.getByRole("heading", { name: "Request Web" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Next.js App Router")).toBeInTheDocument();
  });
});
