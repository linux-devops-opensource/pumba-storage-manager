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
  requestBody,
} from '@loopback/rest';
import {
  Session,
  File,
} from '../models';
import {SessionRepository} from '../repositories';

export class SessionFileController {
  constructor(
    @repository(SessionRepository) protected sessionRepository: SessionRepository,
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

  @post('/sessions/{id}/files', {
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
      content: {
        'application/json': {
          schema: getModelSchemaRef(File, {
            title: 'NewFileInSession',
            exclude: ['name'],
            optional: ['sid']
          }),
        },
      },
    }) file: Omit<File, 'name'>,
  ): Promise<File> {
    return this.sessionRepository.files(id).create(file);
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
