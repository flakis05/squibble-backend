import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { NoteFactory } from '../api/factory/NoteFactory';
import { CreateNoteInput, CreateNoteOutput } from '../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';

export class CreateNoteHandler implements ApiCallHandler<CreateNoteInput, CreateNoteOutput> {
    private client: DynamoDBClientWrapper;
    private noteFactory: NoteFactory;
    constructor(client: DynamoDBClientWrapper, noteFactory: NoteFactory) {
        this.client = client;
        this.noteFactory = noteFactory;
    }
    public handle = async (input: CreateNoteInput): Promise<CreateNoteOutput> => {
        const dateNow = new Date().toISOString();
        const dynamoDbItem: NoteDynamoDbItem = this.noteFactory.toDynamoDbItem({ dateNow, ...input });

        await this.client.create(dynamoDbItem);

        return {
            note: this.noteFactory.fromDynamoDbItem(dynamoDbItem)
        };
    };
}
