import { inject } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { Session } from '../models';
import { SessionRepository } from '../repositories';
import { S3 } from '../services';
import aws4 from 'aws4';
import { AWSS3Bindings, S3WithSigner } from 'loopback4-s3';

const BASE_URL = process.env.S3_BASE_URL;
if (BASE_URL === undefined) {
	throw new Error('base url undefined');
}
const BUCKET_PREFIX = process.env.BUCKET_PREFIX;
const BASE_URL_NO_PREFIX = BASE_URL.replace(/https?:\/\//, '').replace('/', '');
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const SERVICE = 's3';
const REGION = process.env.REGION;

export class SessionController {
	constructor(
		@repository(SessionRepository) public sessionRepository: SessionRepository,
		@inject('services.S3') protected s3Service: S3,
		@inject(AWSS3Bindings.AwsS3Provider) protected s3: S3WithSigner
	) {}

	@post('/sessions')
	@response(200, {
		description: 'Session model instance',
		content: { 'application/json': { schema: getModelSchemaRef(Session) } }
	})
	async create(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(Session, {
						title: 'NewSession'
					})
				}
			}
		})
		session: Session
	): Promise<Session> {
		let data = await this.s3.listBuckets([]);
		console.log(data);

		const bucketData = {
			Bucket: BUCKET_PREFIX + session.sid,
			CreateBucketConfiguration: { LocationConstraint: REGION }
		};
		await this.s3.createBucket(bucketData);

		data = await this.s3.listBuckets([]);
		console.log(data);

		// let opts: any = {
		// 	service: SERVICE,
		// 	host: BASE_URL_NO_PREFIX,
		// 	method: 'PUT',
		// 	path: '/' + BUCKET_PREFIX + session.sid,
		// 	region: REGION,
		// 	body: ''
		// };
		// aws4.sign(opts, { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_ACCESS_KEY });
		// console.log(opts);

		// const auth = opts.headers['Authorization'];
		// const amzDate = opts.headers['X-Amz-Date'];
		// const amzContent = opts.headers['X-Amz-Content-Sha256'];
		// await this.s3Service.newSession(session.sid, auth, amzDate, amzContent);
		return this.sessionRepository.create(session);
	}

	@get('/sessions/count')
	@response(200, {
		description: 'Session model count',
		content: { 'application/json': { schema: CountSchema } }
	})
	async count(@param.where(Session) where?: Where<Session>): Promise<Count> {
		return this.sessionRepository.count(where);
	}

	@get('/sessions')
	@response(200, {
		description: 'Array of Session model instances',
		content: {
			'application/json': {
				schema: {
					type: 'array',
					items: getModelSchemaRef(Session, { includeRelations: true })
				}
			}
		}
	})
	async find(@param.filter(Session) filter?: Filter<Session>): Promise<Session[]> {
		//await this.s3Service.getSessions(process.env.S3_TOKEN ?? 'S3_TOKEN is not defined')
		return this.sessionRepository.find(filter);
	}

	@patch('/sessions')
	@response(200, {
		description: 'Session PATCH success count',
		content: { 'application/json': { schema: CountSchema } }
	})
	async updateAll(
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(Session, { partial: true })
				}
			}
		})
		session: Session,
		@param.where(Session) where?: Where<Session>
	): Promise<Count> {
		return this.sessionRepository.updateAll(session, where);
	}

	@get('/sessions/{id}')
	@response(200, {
		description: 'Session model instance',
		content: {
			'application/json': {
				schema: getModelSchemaRef(Session, { includeRelations: true })
			}
		}
	})
	async findById(
		@param.path.string('id') id: string,
		@param.filter(Session, { exclude: 'where' })
		filter?: FilterExcludingWhere<Session>
	): Promise<Session> {
		return this.sessionRepository.findById(id, filter);
	}

	@patch('/sessions/{id}')
	@response(204, {
		description: 'Session PATCH success'
	})
	async updateById(
		@param.path.string('id') id: string,
		@requestBody({
			content: {
				'application/json': {
					schema: getModelSchemaRef(Session, { partial: true })
				}
			}
		})
		session: Session
	): Promise<void> {
		await this.sessionRepository.updateById(id, session);
	}

	@put('/sessions/{id}')
	@response(204, {
		description: 'Session PUT success'
	})
	async replaceById(@param.path.string('id') id: string, @requestBody() session: Session): Promise<void> {
		await this.sessionRepository.replaceById(id, session);
	}

	@del('/sessions/{id}')
	@response(204, {
		description: 'Session DELETE success'
	})
	async deleteById(@param.path.string('id') id: string): Promise<void> {
		await this.s3Service.deleteSession(id, process.env.S3_TOKEN ? process.env.S3_TOKEN : 'S3_TOKEN is not defined');
		await this.sessionRepository.deleteById(id);
	}
}
