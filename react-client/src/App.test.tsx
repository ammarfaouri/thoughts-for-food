import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./features/marketing/HomePage";

test("renders the home page", () => {
  const { getByText } = render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );

  expect(getByText(/Thoughts for Food/i)).toBeInTheDocument();
});
