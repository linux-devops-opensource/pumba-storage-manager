import { inject, Provider } from '@loopback/core';
import { getService } from '@loopback/service-proxy';
import { S3DataSource } from '../datasources';
import { Auth } from './auth.service';
import qs from 'qs';

export interface S3 {
	// this is where you define the Node.js methods that will be
	// mapped to REST/SOAP/gRPC operations as stated in the datasource
	// json file.
	getSessions(authToken: string): Promise<object>;
	newSession(bucket: string, authToken: string, amzDate: string, amzContent: string): Promise<object>;
	deleteSession(bucket: string, authToken: string): Promise<object>;
	uploadFile(bucket: string, fileName: string, body: Buffer, mimetype: string, authToken: string): Promise<object>;
	getFiles(bucket: string, authToken: string): Promise<object>;
	deleteFile(bucket: string, fileName: string, authToken: string): Promise<object>;
	publicAccess(bucket: string, fileName: string, authToken: string): Promise<Object>;
}

export class S3Provider implements Provider<S3> {
	constructor(
		// s3 must match the name property in the datasource json file
		@inject('datasources.s3') protected dataSource: S3DataSource = new S3DataSource(),
		@inject('services.Auth') protected authService: Auth
	) {}

	async value(): Promise<S3> {
		// const authExpirationTime = process.env.AUTH_EXPIRATION_TIME ? process.env.AUTH_EXPIRATION_TIME : 0;
		// const apiKey = process.env.API_KEY;
		// const grantType = process.env.GRANT_TYPE;
		// const identifiers = qs.stringify({
		// 	apikey: apiKey,
		// 	// for IBM shit API
		// 	// eslint-disable-next-line
		// 	grant_type: grantType
		// });

		// if (apiKey && grantType) {
		// 	if (authExpirationTime.toString() === 'NaN' || authExpirationTime <= Math.floor(Date.now() / 1000)) {
		// 		// for IBM shit API again, we could create response obj but the response fileds contains underscore anway
		// 		// eslint-disable-next-line
		// 		await this.authService
		// 			.getToken(identifiers)
		// 			.then((response: any) => {
		// 				process.env.AUTH_EXPIRATION_TIME = response.expiration;
		// 				process.env.S3_TOKEN = response.token_type + ' ' + response.access_token;
		// 			})
		// 			.catch((err) => {
		// 				throw new Error(err);
		// 			});
		// 	}
		// } else {
		// 	throw new Error('API key OR Grant type not defined');
		// }

		return getService(this.dataSource);
	}
}
