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
  requestBody,
} from '@loopback/rest';
import {
  Session,
  File,
} from '../models';
import {SessionRepository} from '../repositories';
import {S3} from '../services';
require('dotenv').config()
const parser = require('form-parser')

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
    @requestBody({
      description: 'multipart/form-data value.',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {type: 'object'},
        },
      },
    })
    request: Request,
  ): Promise<Object> {
    let file = {}
    await parser(request, async (filed: any) => {
      await this.s3Service.uploadFile(id, filed.fieldContent.fileName, filed.fieldContent.fileStream, filed.fieldContent.fileType, process.env.S3_TOKEN ?? 'S3_TOKEN is not defined')
        file = {
          name: filed.fieldContent.fileName,
          sid: id
        }
    })
    return this.sessionRepository.files(id).create(file)
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
