import { ISharedMap, IFluidContainer, IValueChanged } from 'fluid-framework';
import { EventEmitter } from 'events';
import {
  TinyliciousContainerServices,
  TinyliciousMember,
  ITinyliciousAudience,
} from '@fluidframework/tinylicious-client';
import { Node } from './types';

export type EventPayload = {
  type: string;
  changed: IValueChanged;
  data?: any;
};

export class FluidModel extends EventEmitter {
  private map: ISharedMap;
  private audience: ITinyliciousAudience;
  constructor(private container: IFluidContainer, private services: TinyliciousContainerServices) {
    super();
    this.map = container.initialObjects.myMap as ISharedMap;
    this.audience = services.audience;
    this.map.on('valueChanged', (changed, local, target) => {
      if (!this.nodeExists(changed.key)) {
        const deleteNodePayload: EventPayload = { type: 'singleDelete', changed };
        this.emit('modelChanged', deleteNodePayload);
      } else {
        const changedNodePayload: EventPayload = { type: 'singleChange', changed };
        this.emit('modelChanged', changedNodePayload);
      }
    });
    this.audience.on('memberAdded', (members) => {
      const membersChangedPayload = { type: 'membersChanged' };
      this.emit('modelChanged', membersChangedPayload);
    });
    this.audience.on('memberRemoved', (members) => {
      const membersChangedPayload = { type: 'membersChanged' };
      this.emit('modelChanged', membersChangedPayload);
    });
  }

  public getAudience = (): TinyliciousMember[] => {
    const members = Array.from(this.audience.getMembers().values());

    return members;
  };

  public getAllNodeIds = (): string[] => {
    return Array.from(this.map.keys());
  };

  private nodeExists = (id: string) => {
    return this.getAllNodeIds().includes(id);
  };

  public getNode = (id: string): Node => {
    const node = this.map.get<Node>(id);
    if (node === undefined) {
      throw Error(`${id} not found`);
    }
    return node;
  };

  public getAllNodes = () => {
    const nodeIds = this.getAllNodeIds();
    const nodes: Record<string, Node> = {};
    for (const id of nodeIds) {
      nodes[id] = this.getNode(id);
    }
    return nodes;
  };

  public editNode = (id: string, data: Partial<Node>) => {
    this.map.set(id, data);
  };

  public deleteNode = (id: string) => {
    this.map.delete(id);
  };

  public createNode = (id: string, data: Node) => {
    if (this.map.get(id)) {
      // id already exists
      return;
    }
    this.map.set(id, data);
  };
}
