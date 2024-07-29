import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { UnArchiveNoteInput, UnArchiveNoteOutput } from '../../api/note/model';
import {
    createNoteBasePrimaryKey,
    createNoteGsi1PrimaryKey,
    createNoteGsi2PrimaryKey
} from '../../../dynamodb/key/note-key-factory';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { GSI1PrimaryKey } from '../../../dynamodb/model/Key';

export class UnArchiveNoteHandler implements ApiCallHandler<UnArchiveNoteInput, UnArchiveNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: UnArchiveNoteInput): Promise<UnArchiveNoteOutput> => {
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
            ...createNoteGsi1PrimaryKey(dateNow),
            ...createNoteGsi2PrimaryKey(dateNow),
            modifiedAt: dateNow
        };
    };
}
