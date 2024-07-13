import { ID } from '../../api/model';
import { GenericKey } from './GenericKey';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const sortKey = (noteId: ID): ID => createKey('user', '<user_id>', 'note', noteId);

export const buildBaseGenericKey = (noteId: ID): GenericKey => ({
    pk: partitionKey(),
    sk: sortKey(noteId)
});
