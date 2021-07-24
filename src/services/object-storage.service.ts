import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {ObjectStorageDataSource} from '../datasources';

export interface ObjectStorage {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getSessions(): Promise<object>;
}

export class ObjectStorageProvider implements Provider<ObjectStorage> {
  constructor(
    // objectStorage must match the name property in the datasource json file
    @inject('datasources.objectStorage')
    protected dataSource: ObjectStorageDataSource = new ObjectStorageDataSource(),
  ) {}

  value(): Promise<ObjectStorage> {
    return getService(this.dataSource);
  }
}
