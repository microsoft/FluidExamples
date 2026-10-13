import { test, expect } from "./test-utils.js";

test("notes synchronize in both directions and survive reloading", async ({ page, peer }) => {
	await page.getByRole("button", { name: /Add a sticky note/ }).click();
	const local = page.getByRole("textbox", { name: /Type your note here/ });
	const remote = peer.getByRole("textbox", { name: /Type your note here/ });
	await local.fill("Written by the first client");
	await expect(remote).toHaveValue("Written by the first client");
	await remote.fill("Edited by the second client");
	await expect(local).toHaveValue("Edited by the second client");
	await expect(peer.getByText("saved", { exact: true })).toBeVisible();
	await page.reload();
	await expect(page.getByRole("textbox", { name: /Type your note here/ })).toHaveValue(
		"Edited by the second client"
	);
});

test("selection and cursors disappear when their attendee disconnects", async ({ page, peer }) => {
	await page.getByRole("button", { name: /Add a circle shape/ }).click();
	await page.locator("[data-item-id]").click();
	await expect(peer.locator('[data-layer="presence-overlays"] [data-svg-item-id]')).toHaveCount(
		1
	);
	const canvas = await page.locator("#canvas").boundingBox();
	if (!canvas) throw new Error("Canvas has no bounds");
	await page.mouse.move(canvas.x + 50, canvas.y + 100);
	await expect(peer.locator("[data-presence-cursor]")).toHaveCount(1);
	await page.close();
	await expect(peer.locator('[data-layer="presence-overlays"] [data-svg-item-id]')).toHaveCount(
		0
	);
	await expect(peer.locator("[data-presence-cursor]")).toHaveCount(0);
});

test("ink previews synchronize before a stroke is committed", async ({ page, peer }) => {
	const canvas = await page.locator("#canvas").boundingBox();
	if (!canvas) throw new Error("Canvas has no bounds");
	await page.mouse.move(canvas.x + 50, canvas.y + 100);
	await page.mouse.down();
	await page.mouse.move(canvas.x + 150, canvas.y + 150, { steps: 10 });
	await expect(peer.locator("[data-presence-ink]")).toHaveCount(1);
	await page.mouse.up();
	await expect(peer.locator("[data-presence-ink]")).toHaveCount(0);
	await expect(peer.locator('[data-layer="ink"] > g polyline')).toHaveCount(1);
	await peer.reload();
	await expect(peer.locator('[data-layer="ink"] > g polyline')).toHaveCount(1);
});

test("drag updates keep overlays mounted and publish the final position", async ({
	page,
	peer,
}) => {
	await page.getByRole("button", { name: /Add a circle shape/ }).click();
	const item = page.locator("[data-item-id]");
	await item.click();
	const overlay = page.locator('[data-layer="selection-overlays"] > g');
	await expect(overlay).toHaveCount(1);
	await overlay.evaluate((element) => element.setAttribute("data-original-overlay", "true"));
	const bounds = await item.boundingBox();
	if (!bounds) throw new Error("Item has no bounds");
	const remoteItem = peer.locator("[data-item-id]");
	await expect(remoteItem).toBeVisible();
	const before = await remoteItem.boundingBox();
	if (!before) throw new Error("Remote item has no bounds");
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(bounds.x + bounds.width / 2 + 80, bounds.y + bounds.height / 2 + 40, {
		steps: 10,
	});
	await expect(overlay).toHaveAttribute("data-original-overlay", "true");
	await page.mouse.up();
	await expect
		.poll(async () => Math.round((await remoteItem.boundingBox())!.x - before.x))
		.toBe(80);
});

test("shape resizing and rotation persist and synchronize", async ({ page, peer }) => {
	await page.getByRole("button", { name: /Add a square shape/ }).click();
	const item = page.locator("[data-item-id]");
	const remoteItem = peer.locator("[data-item-id]");
	await item.click();
	await expect(remoteItem).toBeVisible();
	const before = await remoteItem.boundingBox();
	if (!before) throw new Error("Remote item has no bounds");
	const handle = page
		.locator('[data-layer="selection-overlays"] rect[cursor="nwse-resize"]')
		.last();
	const bounds = await handle.boundingBox();
	if (!bounds) throw new Error("Resize handle has no bounds");
	await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
	await page.mouse.down();
	await page.mouse.move(bounds.x + bounds.width / 2 + 50, bounds.y + bounds.height / 2 + 50, {
		steps: 10,
	});
	await page.mouse.up();
	await expect
		.poll(async () => (await remoteItem.boundingBox())!.width)
		.toBeGreaterThan(before.width + 20);

	const originalTransform = await item.evaluate((element) => element.style.transform);
	const rotate = await page
		.locator('[data-layer="selection-overlays"] circle[cursor="grab"]')
		.boundingBox();
	const resized = await item.boundingBox();
	if (!rotate || !resized) throw new Error("Rotation geometry is missing");
	await page.mouse.move(rotate.x + rotate.width / 2, rotate.y + rotate.height / 2);
	await page.mouse.down();
	await page.mouse.move(resized.x + resized.width + 50, resized.y + resized.height / 2, {
		steps: 10,
	});
	await page.mouse.up();
	await expect
		.poll(() => item.evaluate((element) => element.style.transform))
		.not.toBe(originalTransform);
	const finalTransform = await item.evaluate((element) => element.style.transform);
	await expect
		.poll(() => remoteItem.evaluate((element) => element.style.transform))
		.toBe(finalTransform);
	await expect(page.getByText("saved", { exact: true })).toBeVisible();
	await peer.reload();
	await expect
		.poll(() => peer.locator("[data-item-id]").evaluate((element) => element.style.transform))
		.toBe(finalTransform);
});

test("undo does not remove another client's edits", async ({ page, peer }) => {
	await page.keyboard.press("c");
	await expect(page.locator("[data-item-id]")).toHaveCount(1);
	await peer.getByRole("button", { name: /Add a sticky note/ }).click();
	await expect(page.locator("[data-item-id]")).toHaveCount(2);
	await page.getByRole("button", { name: "Undo", exact: true }).click();
	await expect(page.getByRole("textbox", { name: /Type your note here/ })).toBeVisible();
	await expect(peer.getByRole("textbox", { name: /Type your note here/ })).toBeVisible();
	await expect(page.locator("[data-item-id]")).toHaveCount(1);
});
