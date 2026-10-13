import { Item, Items } from "../schema/appSchema.js";

export function findItemById(items: Items, id: string): Item | undefined {
	return items.find((item) => item.id === id);
}

export function findItemsByIds(items: Items, ids: string[]): Item[] {
	return ids
		.map((id) => findItemById(items, id))
		.filter((item): item is Item => item !== undefined);
}

export function getAllItems(items: Items): Item[] {
	return Array.from(items);
}
