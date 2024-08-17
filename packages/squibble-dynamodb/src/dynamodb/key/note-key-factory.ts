import { ID } from '../../api/model';
import { BasePrimaryKey, GSI1PrimaryKey, GSI2PrimaryKey } from '../model/Key';
import { createKey } from './key-factory';

export const noteBasePartitionKey = (): ID => createKey('user', '<user_id>', 'notes');
export const noteBaseSortKey = (noteId: ID): ID => createKey('user', '<user_id>', 'note', noteId);

export const noteGsi1PartitionKey = (): ID => noteBasePartitionKey();
export const archivedNoteGsi1PartitionKey = (): ID => createKey('user', '<user_id>', 'archives');
export const deletedNoteGsi1PartitionKey = (): ID => createKey('user', '<user_id>', 'deleted');
export const gsi1SortKey = (timestamp: string): ID => createKey('user', '<user_id>', 'note', timestamp);

export const noteGsi2PartitionKey = (): ID => noteBasePartitionKey();
export const archivedNoteGsi2PartitionKey = (): ID => archivedNoteGsi1PartitionKey();
export const gsi2SortKey = (timestamp: string): ID => gsi1SortKey(timestamp);

export const createNoteBasePrimaryKey = (noteId: ID): BasePrimaryKey => ({
    pk: noteBasePartitionKey(),
    sk: noteBaseSortKey(noteId)
});

export const createNoteGsi1PrimaryKey = (timestamp: string): GSI1PrimaryKey => ({
    gsi1Pk: noteGsi1PartitionKey(),
    gsi1Sk: gsi1SortKey(timestamp)
});

export const createNoteGsi2PrimaryKey = (timestamp: string): GSI2PrimaryKey => ({
    gsi2Pk: noteGsi2PartitionKey(),
    gsi2Sk: gsi2SortKey(timestamp)
});

export const createArchivedNoteGsi1PrimaryKey = (timestamp: string): GSI1PrimaryKey => ({
    gsi1Pk: archivedNoteGsi1PartitionKey(),
    gsi1Sk: gsi1SortKey(timestamp)
});

export const createArchivedNoteGsi2PrimaryKey = (timestamp: string): GSI2PrimaryKey => ({
    gsi2Pk: archivedNoteGsi2PartitionKey(),
    gsi2Sk: gsi2SortKey(timestamp)
});

export const createDeletedNoteGsi1PrimaryKey = (timestamp: string): GSI1PrimaryKey => ({
    gsi1Pk: deletedNoteGsi1PartitionKey(),
    gsi1Sk: gsi1SortKey(timestamp)
});
