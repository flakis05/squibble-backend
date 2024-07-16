import { createBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { fromDynamoDbItem } from '../../api/note/factory/note-factory';
import { GetNoteInput, GetNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../ApiCallHandler';

export class GetNoteHandler implements ApiCallHandler<GetNoteInput, GetNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: GetNoteInput): Promise<GetNoteOutput> => {
        const key = createBasePrimaryKey(input.noteId);
        const { item } = await this.client.get<NoteDynamoDbItem>(key);

        const note = fromDynamoDbItem(item);
        return {
            note
        };
    };
}
