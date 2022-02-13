import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

const BASE_URL = process.env.S3_BASE_URL;
const PREFIX = process.env.BUCKET_PREFIX;
if (BASE_URL == undefined || PREFIX == undefined) {
	console.log('some variables not defined');
	throw new Error();
}

const config = {
	name: 's3',
	connector: 'rest',
	baseURL: BASE_URL,
	crud: false,
	options: {
		headers: {
			accept: 'application/json',
			'ibm-service-instance-id': process.env.S3_RESOURCE_INSTANCE_ID
		}
	},
	operations: [
		{
			template: {
				method: 'GET',
				url: BASE_URL,
				headers: {
					Authorization: '{authToken}'
				}
			},
			functions: {
				getSessions: [ 'authToken' ]
			}
		},
		{
			template: {
				method: 'PUT',
				url: BASE_URL + PREFIX + '{bucket}',
				headers: {
					Authorization: '{authToken}'
				}
			},
			functions: {
				newSession: [ 'bucket', 'authToken' ]
			}
		},
		{
			template: {
				method: 'DELETE',
				url: BASE_URL + PREFIX + '{bucket}',
				headers: {
					Authorization: '{authToken}'
				}
			},
			functions: {
				deleteSession: [ 'bucket', 'authToken' ]
			}
		},
		{
			template: {
				method: 'GET',
				url: BASE_URL + PREFIX + '{bucket}',
				headers: {
					Authorization: '{authToken}'
				}
			},
			functions: {
				getFiles: [ 'bucket', 'authToken' ]
			}
		},
		{
			template: {
				method: 'DELETE',
				url: BASE_URL + PREFIX + '{bucket}/{fileName}',
				headers: {
					Authorization: '{authToken}'
				}
			},
			functions: {
				deleteFile: [ 'bucket', 'fileName', 'authToken' ]
			}
		},
		{
			template: {
				method: 'PUT',
				url: BASE_URL + PREFIX + '{bucket}/{fileName}',
				headers: {
					Authorization: '{authToken}',
					'content-type': '{mimetype}'
				},
				body: '{body}'
			},
			functions: {
				uploadFile: [ 'bucket', 'fileName', 'body', 'mimetype', 'authToken' ]
			}
		},
		{
			template: {
				method: 'PUT',
				url: BASE_URL + PREFIX + '{bucket}/{fileName}?acl',
				headers: {
					Authorization: '{authToken}',
					'x-amz-acl': 'public-read'
				}
			},
			functions: {
				publicAccess: [ 'bucket', 'fileName', 'authToken' ]
			}
		}
	]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class S3DataSource extends juggler.DataSource implements LifeCycleObserver {
	static dataSourceName = 's3';
	static readonly defaultConfig = config;

	constructor(
		@inject('datasources.config.s3', { optional: true })
		dsConfig: object = config
	) {
		super(dsConfig);
	}
}
