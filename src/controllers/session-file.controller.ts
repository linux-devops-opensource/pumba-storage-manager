import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  Request,
  Response,
  requestBody,
  RestBindings,
} from '@loopback/rest';
import {
  Session,
  File,
} from '../models';
import {SessionRepository} from '../repositories';
import {S3} from '../services';
import multer from 'multer';
require('dotenv').config()

export class SessionFileController {
  constructor(
    @repository(SessionRepository) protected sessionRepository: SessionRepository,
    @inject('services.S3')
    protected s3Service: S3,
  ) { }

  @get('/sessions/{id}/files', {
    responses: {
      '200': {
        description: 'Array of Session has many File',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(File)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<File>,
  ): Promise<File[]> {
    return this.sessionRepository.files(id).find(filter);
  }

  @post('/sessions/{id}/file/{name}', {
    responses: {
      '200': {
        description: 'Session model instance',
        content: {'application/json': {schema: getModelSchemaRef(File)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Session.prototype.sid,
    @param.path.string('name') name: typeof Session.prototype.sid,
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<Object> {
    const upload = multer()
    return new Promise<object>(async (resolve, reject) => {
      upload.single('file')(request, response, async (err: any) => {
        if (err) reject(err);
          else {
            try {
              if (request.file?.originalname) {
                await this.s3Service.uploadFile(id, request.file?.originalname, request.file?.buffer, request.file?.mimetype)
              }
              const f = {
                name: request.file?.originalname,
                sid: id
              }
              resolve(this.sessionRepository.files(id).create(f))
            } catch(err) {
              reject(err)
            }
        }
      })
    });
  }

  @patch('/sessions/{id}/files', {
    responses: {
      '200': {
        description: 'Session.File PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(File, {partial: true}),
        },
      },
    })
    file: Partial<File>,
    @param.query.object('where', getWhereSchemaFor(File)) where?: Where<File>,
  ): Promise<Count> {
    return this.sessionRepository.files(id).patch(file, where);
  }

  @del('/sessions/{id}/files', {
    responses: {
      '200': {
        description: 'Session.File DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(File)) where?: Where<File>,
  ): Promise<Count> {
    return this.sessionRepository.files(id).delete(where);
  }
}
