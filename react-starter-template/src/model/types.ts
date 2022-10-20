import { ISharedMap } from "fluid-framework";
import { TinyliciousMember } from "@fluidframework/tinylicious-client";

export interface Node {
    value: number;
}

export interface AudienceMember extends TinyliciousMember {}

export interface InitialObjects {
    myMap: ISharedMap;
}
