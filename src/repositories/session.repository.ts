import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {SessionsDsDataSource} from '../datasources';
import {Session, SessionRelations, File} from '../models';
import {FileRepository} from './file.repository';

export class SessionRepository extends DefaultCrudRepository<
  Session,
  typeof Session.prototype.sid,
  SessionRelations
> {

  public readonly files: HasManyRepositoryFactory<File, typeof Session.prototype.sid>;

  constructor(
    @inject('datasources.sessionsDs') dataSource: SessionsDsDataSource, @repository.getter('FileRepository') protected fileRepositoryGetter: Getter<FileRepository>,
  ) {
    super(Session, dataSource);
    this.files = this.createHasManyRepositoryFactoryFor('files', fileRepositoryGetter,);
    this.registerInclusionResolver('files', this.files.inclusionResolver);
  }
}
