import { ID } from '../../api/model';
import { BasePrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const labelBasePartitionKey = (): ID => createKey('user', '<user_id>', 'labels');
export const labelBaseSortKey = (labelId: ID): ID => createKey('user', '<user_id>', 'label', labelId);

export const createLabelBasePrimaryKey = (labelId: ID): BasePrimaryKey => ({
    pk: labelBasePartitionKey(),
    sk: labelBaseSortKey(labelId)
});
