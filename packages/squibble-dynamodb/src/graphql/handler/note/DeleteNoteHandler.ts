import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { DeleteNoteInput, DeleteNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../ApiCallHandler';
import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

export class DeleteNoteHandler implements ApiCallHandler<DeleteNoteInput, DeleteNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: DeleteNoteInput): Promise<DeleteNoteOutput> => {
        const dateNow = new Date().toISOString();
        const key = createNoteBasePrimaryKey(input.noteId);
        const noteDynamoDbItem = this.createUpdatedNoteDynamoDbItem({ dateNow, ...input });

        await this.client.update(key, noteDynamoDbItem);

        return {
            success: true
        };
    };

    private createUpdatedNoteDynamoDbItem = (
        input: WithDateNow<DeleteNoteInput>
    ): UpdatedDynamoDbItem<NoteDynamoDbItem> => {
        return {
            deletedAt: input.dateNow
        };
    };
}
