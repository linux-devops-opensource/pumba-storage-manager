import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { AWSS3Bindings, AwsS3Component, AwsS3Config } from 'loopback4-s3';
require('dotenv').config();

const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;
const BASE_URL = process.env.S3_BASE_URL;
if (BASE_URL === undefined) {
	throw new Error('base url undefined');
}

const BASE_URL_NO_PREFIX = BASE_URL.replace(/https?:\/\//, '').replace('/', '');

export { ApplicationConfig };

export class StorageManagerApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
	constructor(options: ApplicationConfig = {}) {
		super(options);

		// Set up the custom sequence
		this.sequence(MySequence);

		// Set up default home page
		this.static('/', path.join(__dirname, '../public'));

		// Customize @loopback/rest-explorer configuration here
		this.configure(RestExplorerBindings.COMPONENT).to({
			path: '/explorer'
		});
		this.component(RestExplorerComponent);

		this.bind(AWSS3Bindings.Config).to({
			accessKeyId: ACCESS_KEY,
			secretAccessKey: SECRET_ACCESS_KEY,
			region: REGION,
			endpoint: BASE_URL
		} as AwsS3Config);
		this.component(AwsS3Component);

		this.projectRoot = __dirname;
		// Customize @loopback/boot Booter Conventions here
		this.bootOptions = {
			controllers: {
				// Customize ControllerBooter Conventions here
				dirs: [ 'controllers' ],
				extensions: [ '.controller.js' ],
				nested: true
			}
		};
	}
}
