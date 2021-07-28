import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {AuthDataSource} from '../datasources';

export interface Auth {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getToken(identifiers: string): Promise<object>
}

export class AuthProvider implements Provider<Auth> {
  constructor(
    // auth must match the name property in the datasource json file
    @inject('datasources.auth')
    protected dataSource: AuthDataSource = new AuthDataSource(),
  ) {}

  value(): Promise<Auth> {
    return getService(this.dataSource);
  }
}
