import { ID } from '../../api/model';
import { BasePrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const sortKey = (noteId: ID): ID => createKey('user', '<user_id>', 'note', noteId);

export const createNoteBasePrimaryKey = (noteId: ID): BasePrimaryKey => ({
    pk: partitionKey(),
    sk: sortKey(noteId)
});
