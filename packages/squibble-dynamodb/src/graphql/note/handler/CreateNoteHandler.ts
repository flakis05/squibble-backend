import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { CreateNoteInput, CreateNoteOutput } from '../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { fromDynamoDbItem } from '../api/factory/note-factory';
import { WithDateNow } from '../../../api/model';
import { partitionKey, sortKey } from '../../../dynamodb/key/note-key-factory';
import { KeySupplier } from '../../util/KeySupplier';

export class CreateNoteHandler implements ApiCallHandler<CreateNoteInput, CreateNoteOutput> {
    private client: DynamoDBClientWrapper;
    private keySupplier: KeySupplier;
    constructor(client: DynamoDBClientWrapper, keySupplier: KeySupplier) {
        this.client = client;
        this.keySupplier = keySupplier;
    }
    public handle = async (input: CreateNoteInput): Promise<CreateNoteOutput> => {
        const dateNow = new Date().toISOString();
        const dynamoDbItem: NoteDynamoDbItem = this.toDynamoDbItem({ dateNow, ...input });

        await this.client.create(dynamoDbItem);

        return {
            note: fromDynamoDbItem(dynamoDbItem)
        };
    };

    private toDynamoDbItem = (input: WithDateNow<CreateNoteInput>) => {
        const noteId = this.keySupplier.get();
        return {
            pk: partitionKey(),
            sk: sortKey(noteId),
            createdAt: input.dateNow,
            modifiedAt: input.dateNow,
            noteId: noteId,
            title: input.title,
            content: input.content
        };
    };
}
