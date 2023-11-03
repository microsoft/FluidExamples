import { describe, test, expect } from "vitest";
import App from "./App.svelte";
import { render, fireEvent, screen, waitFor } from "@testing-library/svelte";

describe("App Component", () => {
	test("should render the component with undefined timestamp initially", async () => {
		render(App);

		const timeElement = screen.queryByText("undefined");
		expect(timeElement).not.toBe(null);
	});
});
