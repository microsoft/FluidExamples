import { SharedMap, ISharedMap, IFluidContainer, ContainerSchema } from "fluid-framework";
import { TinyliciousClientProps } from "@fluidframework/tinylicious-client";

////
// Container and App setup
////

export const containerSchema: ContainerSchema = {
	initialObjects: {
		myMap: SharedMap,
	},
};

// changes URL path to your fluid pages
// "fluid" yields a `/fluid/123` file path
export const FILEPATH: string = "fluid";

// Additional service configuration
export const clientProps: TinyliciousClientProps = {};

// Setup default data on initialObjects
export const setDefaultData = (fluidContainer: IFluidContainer) => {
	const defaultData: any[] = [
		{
			id: "1",
			value: 1,
		},
		{
			id: "2",
			value: 2,
		},
	];
	const map = fluidContainer.initialObjects.myMap as ISharedMap;
	for (const data of defaultData) {
		map.set(data.id, { value: data.value });
	}
};
