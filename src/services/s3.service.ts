import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {S3DataSource} from '../datasources';

export interface S3 {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getSessions(): Promise<object>;
  newSession(bucket: string): Promise<object>;
  deleteSession(bucket: string):Promise<object>;
  uploadFile(bucket: string,fileName: string, body: Buffer, mimetype: string): Promise<object>;
}

export class S3Provider implements Provider<S3> {
  constructor(
    // s3 must match the name property in the datasource json file
    @inject('datasources.s3')
    protected dataSource: S3DataSource = new S3DataSource(),
  ) {}

  value(): Promise<S3> {
    return getService(this.dataSource);
  }
}
