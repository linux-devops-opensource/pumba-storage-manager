import {ApplicationConfig, StorageManagerApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  if (process.env.API_KEY == undefined) {
    throw new Error('API_KEY is not defined')
  }
  if ( process.env.AUTH_BASE_URL == undefined ) {
    throw new Error('AUTH_BASE_URL is not defined')
  }
  if ( process.env.S3_BASE_URL == undefined ) {
    throw new Error('S3_BASE_URL is not defined')
  }
  if ( process.env.BUCKET_PREFIX == undefined ) {
    throw new Error('BUCKET_PREFIX is not defined')
  }

  if ( process.env.GRANT_TYPE == undefined ) {
    throw new Error('GRANT_TYPE is not defined')
  }
  // if ( process.env.AUTH_BASE_URL == undefined ) {
  //   throw new Error('AUTH_BASE_URL is not defined')
  // }


  const app = new StorageManagerApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
