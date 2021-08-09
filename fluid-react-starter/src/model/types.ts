import { ISharedMap } from '@fluid-experimental/fluid-framework';
import { FrsMember } from '@fluid-experimental/frs-client';

export interface Node {
  value: number;
}

export interface AudienceMember extends FrsMember {}

export interface InitialObjects {
  myMap: ISharedMap;
}
