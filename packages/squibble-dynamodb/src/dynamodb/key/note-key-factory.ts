import { ID } from '../../api/model';
import { BasePrimaryKey, GSI1PrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const sortKey = (noteId: ID): ID => createKey('user', '<user_id>', 'note', noteId);
export const gsi1PartitionKey = (): ID => createKey('user', '<user_id>', 'archives');
export const gsi1SortKey = (modifiedAt: string): ID => createKey('user', '<user_id>', 'note', modifiedAt);

export const createNoteBasePrimaryKey = (noteId: ID): BasePrimaryKey => ({
    pk: partitionKey(),
    sk: sortKey(noteId)
});

export const createNoteGSI1PrimaryKey = (modifiedAt: string): GSI1PrimaryKey => ({
    gsi1Pk: gsi1PartitionKey(),
    gsi1Sk: gsi1SortKey(modifiedAt)
});
