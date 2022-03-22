import { Session } from './session.model';
import { belongsTo, Entity, model, property } from '@loopback/repository';

@model({ settings: { strict: false } })
export class File extends Entity {
	@property({
		type: 'string',
		generated: true,
		required: true,
		id: true
	})
	id: string;

	@property({
		type: 'string',
		// id: true,
		generated: false,
		required: true
	})
	name: string;

	@belongsTo(() => Session, { keyFrom: 'sid' })
	// @property({
	// 	type: 'string'
	// })
	sid?: string;

	constructor(data?: Partial<File>) {
		super(data);
	}
}

export interface FileRelations {
	// describe navigational properties here
}

export type FileWithRelations = File & FileRelations;
