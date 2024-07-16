import { ID } from '../../api/model';
import { BasePrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const sortKey = (noteId: ID, labelId: ID): ID =>
    createKey('user', '<user_id>', 'note', noteId, 'label', labelId);

export const buildBasePrimaryKey = (noteId: ID, labelId: ID): BasePrimaryKey => ({
    pk: partitionKey(),
    sk: sortKey(noteId, labelId)
});
