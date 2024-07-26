import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { ArchiveNoteInput, ArchiveNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey, createArchivedNoteGsi1PrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { GSI1PrimaryKey } from '../../../dynamodb/model/Key';

export class ArchiveNoteHandler implements ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: ArchiveNoteInput): Promise<ArchiveNoteOutput> => {
        const dateNow = new Date().toISOString();
        const key = createNoteBasePrimaryKey(input.noteId);
        const noteDynamoDbItem = this.createUpdatedNoteDynamoDbItem(dateNow);

        await this.client.update(key, noteDynamoDbItem);

        return {
            note: {
                noteId: input.noteId
            }
        };
    };

    private createUpdatedNoteDynamoDbItem = (
        dateNow: string
    ): UpdatedDynamoDbItem<NoteDynamoDbItem, GSI1PrimaryKey> => {
        return {
            ...createArchivedNoteGsi1PrimaryKey(dateNow),
            modifiedAt: dateNow
        };
    };
}
