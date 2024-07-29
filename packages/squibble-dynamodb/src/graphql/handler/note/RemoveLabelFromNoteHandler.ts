import { ApiCallHandler } from '../ApiCallHandler';
import { RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey, gsi1SortKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import {
    AdvancedDynamoDbClientWrapper,
    TransactUpdateItem
} from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Table } from '../../../dynamodb/model/Table';
import { createUpdateExpression } from '../../../dynamodb/util/expression-factory';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

export class RemoveLabelFromNoteHandler implements ApiCallHandler<RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput> {
    private client: AdvancedDynamoDbClientWrapper;
    constructor(client: AdvancedDynamoDbClientWrapper) {
        this.client = client;
    }
    public handle = async (input: RemoveLabelFromNoteInput): Promise<RemoveLabelFromNoteOutput> => {
        const dateNow = new Date().toISOString();

        const addLabelToNoteTransaction: TransactWriteCommandInput = {
            TransactItems: [
                {
                    Update: this.addLabelToNote({ dateNow, ...input })
                }
            ]
        };
        await this.client.writeTranscation(addLabelToNoteTransaction);

        return {
            note: {
                noteId: input.noteId
            }
        };
    };

    private createUpdatedNoteDynamoDbItem = (
        input: WithDateNow<RemoveLabelFromNoteInput>
    ): UpdatedDynamoDbItem<NoteDynamoDbItem, { labels: Record<string, null> }> => ({
        gsi1Sk: gsi1SortKey(input.dateNow),
        modifiedAt: input.dateNow,
        labels: {
            [input.labelId]: null
        }
    });

    private addLabelToNote = (input: WithDateNow<RemoveLabelFromNoteInput>): TransactUpdateItem => ({
        TableName: Table.BASE,
        Key: createNoteBasePrimaryKey(input.noteId),
        ...createUpdateExpression(this.createUpdatedNoteDynamoDbItem(input))
    });
}
