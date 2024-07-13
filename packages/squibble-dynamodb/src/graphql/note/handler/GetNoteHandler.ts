import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { GetNoteInput, GetNoteOutput } from '../api/model';
import { buildBaseGenericKey } from '../../../dynamodb/key/note-key-factory';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { NoteFactory } from '../api/factory/NoteFactory';

export class GetNoteHandler implements ApiCallHandler<GetNoteInput, GetNoteOutput> {
    private client: DynamoDBClientWrapper;
    private noteFactory: NoteFactory;
    constructor(client: DynamoDBClientWrapper, noteFactory: NoteFactory) {
        this.client = client;
        this.noteFactory = noteFactory;
    }
    public handle = async (input: GetNoteInput): Promise<GetNoteOutput> => {
        const key = buildBaseGenericKey(input.noteId);
        const { item } = await this.client.get<NoteDynamoDbItem>(key);

        const note = this.noteFactory.fromDynamoDbItem(item);
        return {
            note
        };
    };
}
