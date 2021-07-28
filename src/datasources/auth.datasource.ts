import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const BASE_URL = process.env.AUTH_BASE_URL ?? process.env.DEFAULT_AUTH_BASE_URL ?? 'variable not defined'

const config = {
  name: 'auth',
  connector: 'rest',
  baseURL: BASE_URL,
  crud: false,
  options: {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  operations: [
    {
      template: {
        method: 'POST',
        url: BASE_URL + '/oidc/token',
        body: '{identifiers}'
      },
      functions: {
        getToken: ['identifiers'],
      },
    },
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AuthDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'auth';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.auth', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
