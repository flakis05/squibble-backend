import { ID } from '../../api/model';
import { BasePrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'labels');
export const sortKey = (labelId: ID): ID => createKey('user', '<user_id>', 'label', labelId);

export const createLabelBasePrimaryKey = (labelId: ID): BasePrimaryKey => ({
    pk: partitionKey(),
    sk: sortKey(labelId)
});
