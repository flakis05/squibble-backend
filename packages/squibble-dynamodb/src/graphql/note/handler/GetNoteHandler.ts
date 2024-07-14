import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { GetNoteInput, GetNoteOutput } from '../api/model';
import { buildBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { fromDynamoDbItem } from '../api/factory/note-factory';

export class GetNoteHandler implements ApiCallHandler<GetNoteInput, GetNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: GetNoteInput): Promise<GetNoteOutput> => {
        const key = buildBasePrimaryKey(input.noteId);
        const { item } = await this.client.get<NoteDynamoDbItem>(key);

        const note = fromDynamoDbItem(item);
        return {
            note
        };
    };
}
