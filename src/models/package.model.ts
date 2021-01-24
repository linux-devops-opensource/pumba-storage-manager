import {Entity, model, property} from '@loopback/repository';

@model()
export class Package extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'any',
    id: true,
    generated: false,
    required: true,
  })
  id: any;

  @property({
    type: 'any',
    generated: false,
  })
  file: any;

  @property({
    type: 'string',
    generated: false,
    required: true,
  })
  sid: string;

  constructor(data?: Partial<Package>) {
    super(data);
  }
}

export interface PackageRelations {
  // describe navigational properties here
}

export type PackageWithRelations = Package & PackageRelations;
