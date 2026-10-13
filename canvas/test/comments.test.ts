import { test, expect } from "./test-utils.js";

test("anonymous collaborators vote independently and share item comments", async ({
	page,
	peer,
}) => {
	await page.getByRole("button", { name: /Add a circle shape/ }).click();
	await page.locator("[data-item-id]").click();
	await peer.locator("[data-item-id]").click();
	await page.getByRole("button", { name: "Vote (0)", exact: true }).click();
	await peer.getByRole("button", { name: "Vote (1)", exact: true }).click();
	await expect(
		page.getByRole("button", { name: "Remove your vote (2)", exact: true })
	).toBeVisible();
	await page.getByRole("button", { name: /Add a comment|View comments/ }).click();
	await page.getByPlaceholder("Type your comment here...").fill("A shared comment");
	await page.getByRole("button", { name: "Comment", exact: true }).click();
	await peer.getByRole("button", { name: /Add a comment|View comments/ }).click();
	await expect(peer.getByText("A shared comment", { exact: true })).toBeVisible();
});
