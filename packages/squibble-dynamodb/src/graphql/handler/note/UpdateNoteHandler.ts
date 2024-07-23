import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { UpdateNoteInput, UpdateNoteOutput } from '../../api/note/model';
import { createBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { BasePrimaryKey } from '../../../dynamodb/model/Key';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';

export class UpdateNoteHandler implements ApiCallHandler<UpdateNoteInput, UpdateNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: UpdateNoteInput): Promise<UpdateNoteOutput> => {
        const dateNow = new Date().toISOString();
        const key = createBasePrimaryKey(input.noteId);
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
    ): Partial<Omit<NoteDynamoDbItem, keyof BasePrimaryKey>> => {
        return {
            modifiedAt: input.dateNow,
            ...input
        };
    };
}
