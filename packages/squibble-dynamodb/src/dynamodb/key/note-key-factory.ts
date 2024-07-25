import { ID } from '../../api/model';
import { Attribute } from '../model/Attribute';
import { BasePrimaryKey, GSI1PrimaryKey } from '../model/Key';
import { NoteDynamoDbItem } from '../model/Note';
import { createKey } from './key-factory';

export const partitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const sortKey = (noteId: ID): ID => createKey('user', '<user_id>', 'note', noteId);
export const gsi1PartitionKey = (): ID => createKey('user', '<user_id>', 'archives');
export const gsi1SortKey = (input: Pick<NoteDynamoDbItem, Attribute.MODIFIED_AT>): ID => createKey('user', '<user_id>', 'note', input.modifiedAt);



export const createNoteBasePrimaryKey = (noteId: ID): BasePrimaryKey => ({
    pk: partitionKey(),
    sk: sortKey(noteId)
});



export const createNoteGSI1PrimaryKey = (input: Pick<NoteDynamoDbItem, Attribute.MODIFIED_AT>): GSI1PrimaryKey => ({
    gsi1Pk: gsi1PartitionKey(),
    gsi1Sk: gsi1SortKey(input)
});
