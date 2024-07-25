import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { UpdateNoteInput, UpdateNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

export class UpdateNoteHandler implements ApiCallHandler<UpdateNoteInput, UpdateNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: UpdateNoteInput): Promise<UpdateNoteOutput> => {
        const dateNow = new Date().toISOString();
        const key = createNoteBasePrimaryKey(input.noteId);
        const noteDynamoDbItem = this.createUpdatedNoteDynamoDbItem({ dateNow, ...input });

        await this.client.update(key, noteDynamoDbItem);

        return {
            note: {
                noteId: input.noteId
            }
        };
    };

    private createUpdatedNoteDynamoDbItem = (
        input: WithDateNow<UpdateNoteInput>
    ): UpdatedDynamoDbItem<NoteDynamoDbItem> => {
        return {
            modifiedAt: input.dateNow,
            ...input
        };
    };
}
