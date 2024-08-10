import { ApiCallHandler } from '../ApiCallHandler';
import { RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey, gsi1SortKey } from '../../../dynamodb/key/note-key-factory';
import { NullableObjectValues, WithDateNow } from '../../../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import {
    AdvancedDynamoDbClientWrapper,
    TransactDeleteItem,
    TransactUpdateItem
} from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Table } from '../../../dynamodb/model/Table';
import { createUpdateExpression } from '../../../dynamodb/util/expression-factory';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { createNoteLabelBasePrimaryKey } from '../../../dynamodb/key/note-label-key-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';

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
                    Update: this.removeLabelFromNote({ dateNow, ...input })
                },
                {
                    Delete: this.deleteNoteLabelAssociation(input)
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
    ): UpdatedDynamoDbItem<NoteDynamoDbItem, NullableObjectValues<Pick<NoteDynamoDbItem, Attribute.LABELS>>> => ({
        gsi1Sk: gsi1SortKey(input.dateNow),
        modifiedAt: input.dateNow,
        labels: {
            [input.labelId]: null
        }
    });

    private removeLabelFromNote = (input: WithDateNow<RemoveLabelFromNoteInput>): TransactUpdateItem => ({
        TableName: Table.BASE,
        Key: createNoteBasePrimaryKey(input.noteId),
        ...createUpdateExpression<NoteDynamoDbItem>(this.createUpdatedNoteDynamoDbItem(input))
    });

    private deleteNoteLabelAssociation = (input: RemoveLabelFromNoteInput): TransactDeleteItem => ({
        TableName: Table.BASE,
        Key: createNoteLabelBasePrimaryKey(input.noteId, input.labelId)
    });
}
