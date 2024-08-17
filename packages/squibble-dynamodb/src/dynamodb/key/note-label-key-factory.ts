import { ID } from '../../api/model';
import { BasePrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const noteLabelPartitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const noteLabelSortKey = (noteId: ID, labelId: ID): ID =>
    createKey('user', '<user_id>', 'note', noteId, 'label', labelId);

export const createNoteLabelBasePrimaryKey = (noteId: ID, labelId: ID): BasePrimaryKey => ({
    pk: noteLabelPartitionKey(),
    sk: noteLabelSortKey(noteId, labelId)
});
