import { ApiCallHandler } from '../ApiCallHandler';
import { AddLabelToNoteInput, AddLabelToNoteOutput } from '../../api/note/model';
import { createNoteBasePrimaryKey, gsi1SortKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import {
    AdvancedDynamoDbClientWrapper,
    TransactConditionCheckItem,
    TransactPutItem,
    TransactUpdateItem
} from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Table } from '../../../dynamodb/model/Table';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { createUpdateExpression } from '../../../dynamodb/util/expression-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';
import { createNoteLabelDynamoDbItem } from '../../api/note/factory/note-label-factory';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { attributeExists } from '../../../dynamodb/util/condition-expression';

export class AddLabelToNoteHandler implements ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput> {
    private client: AdvancedDynamoDbClientWrapper;
    constructor(client: AdvancedDynamoDbClientWrapper) {
        this.client = client;
    }
    public handle = async (input: AddLabelToNoteInput): Promise<AddLabelToNoteOutput> => {
        const dateNow = new Date().toISOString();

        const addLabelToNoteTransaction: TransactWriteCommandInput = {
            TransactItems: [
                {
                    ConditionCheck: this.checkIfLabelIdExists(input)
                },
                {
                    Update: this.addLabelToNote({ dateNow, ...input })
                },
                {
                    Put: this.createNoteLabelAssociation({ dateNow, ...input })
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
        input: WithDateNow<AddLabelToNoteInput>
    ): UpdatedDynamoDbItem<NoteDynamoDbItem> => ({
        gsi1Sk: gsi1SortKey(input.dateNow),
        modifiedAt: input.dateNow,
        labels: {
            [input.label.labelId]: {
                labelId: input.label.labelId,
                color: input.label.color,
                addedAt: input.dateNow
            }
        }
    });

    private checkIfLabelIdExists = (input: AddLabelToNoteInput): TransactConditionCheckItem => ({
        TableName: Table.BASE,
        Key: createLabelBasePrimaryKey(input.label.labelId),
        ConditionExpression: attributeExists(Attribute.PK)
    });

    private addLabelToNote = (input: WithDateNow<AddLabelToNoteInput>): TransactUpdateItem => ({
        TableName: Table.BASE,
        Key: createNoteBasePrimaryKey(input.noteId),
        ...createUpdateExpression(this.createUpdatedNoteDynamoDbItem(input))
    });

    private createNoteLabelAssociation = (input: WithDateNow<AddLabelToNoteInput>): TransactPutItem => ({
        TableName: Table.BASE,
        Item: createNoteLabelDynamoDbItem(input)
    });
}
