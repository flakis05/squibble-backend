import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { AddLabelToNoteInput, AddLabelToNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { BasePrimaryKey } from '../../../dynamodb/model/Key';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';

export class AddLabelToNoteHandler implements ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: AddLabelToNoteInput): Promise<AddLabelToNoteOutput> => {
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
        input: WithDateNow<AddLabelToNoteInput>
    ): Partial<Omit<NoteDynamoDbItem, keyof BasePrimaryKey>> => {
        const label = input.label;
        return {
            modifiedAt: input.dateNow,
            labels: {
                [label.labelId]: {
                    labelId: label.labelId,
                    color: label.color,
                    addedAt: input.dateNow
                }
            }
        };
    };
}
