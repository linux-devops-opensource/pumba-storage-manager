import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {FileDsDataSource} from '../datasources';
import {File, FileRelations} from '../models';

export class FileRepository extends DefaultCrudRepository<
  File,
  typeof File.prototype.name,
  FileRelations
> {
  constructor(
    @inject('datasources.fileDs') dataSource: FileDsDataSource,
  ) {
    super(File, dataSource);
  }
}
