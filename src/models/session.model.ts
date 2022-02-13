import { Entity, model, property, hasMany } from '@loopback/repository';
import { File } from './file.model';

@model({ settings: { strict: false } })
export class Session extends Entity {
	@property({
		type: 'string',
		id: true,
		generated: false,
		required: true
	})
	sid: string;

	@hasMany(() => File, { keyTo: 'sid' })
	files: File[];

	constructor(data?: Partial<Session>) {
		super(data);
	}
}

export interface SessionRelations {
	// describe navigational properties here
}

export type SessionWithRelations = Session & SessionRelations;
