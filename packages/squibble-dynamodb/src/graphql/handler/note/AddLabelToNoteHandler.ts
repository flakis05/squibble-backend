import { ApiCallHandler } from '../ApiCallHandler';
import { AddLabelToNoteInput, AddLabelToNoteOutput, NoteId } from '../../api/note/model';
import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { ID, WithDateNow } from '../../../api/model';
import { BasePrimaryKey } from '../../../dynamodb/model/Key';
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
import { attributeExists, createUpdateExpression } from '../../../dynamodb/util/expression-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';
import { createNoteLabelBasePrimaryKey } from '../../../dynamodb/key/note-label-key-factory';
import { LabelInput } from '../../api/label/model';
import { NoteLabelDynamoDbItem } from '../../../dynamodb/model/NoteLabel';

export class AddLabelToNoteHandler implements ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput> {
    private client: AdvancedDynamoDbClientWrapper;
    constructor(client: AdvancedDynamoDbClientWrapper) {
        this.client = client;
    }
    public handle = async (input: AddLabelToNoteInput): Promise<AddLabelToNoteOutput> => {
        const { noteId, label } = input;
        const dateNow = new Date().toISOString();
        const noteDynamoDbItem = this.createUpdatedNoteDynamoDbItem({ dateNow, ...label });

        const addLabelToNoteTransaction: TransactWriteCommandInput = {
            TransactItems: [
                {
                    ConditionCheck: this.checkIfLabelIdExists(label.labelId)
                },
                {
                    Update: this.addLabelToNote(noteId, noteDynamoDbItem)
                },
                {
                    Put: this.createNoteLabelAssociation(dateNow, noteId, label)
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
        input: WithDateNow<LabelInput>
    ): Partial<Omit<NoteDynamoDbItem, keyof BasePrimaryKey>> => {
        return {
            modifiedAt: input.dateNow,
            labels: {
                [input.labelId]: {
                    labelId: input.labelId,
                    color: input.color,
                    addedAt: input.dateNow
                }
            }
        };
    };

    private createNoteLabelDynamoDbItems = (input: WithDateNow<LabelInput & NoteId>): NoteLabelDynamoDbItem => ({
        ...createNoteLabelBasePrimaryKey(input.noteId, input.labelId),
        noteId: input.noteId,
        labelId: input.labelId,
        createdAt: input.dateNow
    });

    private checkIfLabelIdExists = (labelId: ID): TransactConditionCheckItem => ({
        TableName: Table.BASE,
        Key: createLabelBasePrimaryKey(labelId),
        ConditionExpression: attributeExists(Attribute.PK)
    });

    private addLabelToNote = (
        noteId: ID,
        item: Partial<Omit<NoteDynamoDbItem, keyof BasePrimaryKey>>
    ): TransactUpdateItem => ({
        TableName: Table.BASE,
        Key: createNoteBasePrimaryKey(noteId),
        ...createUpdateExpression(item)
    });

    private createNoteLabelAssociation = (dateNow: string, noteId: ID, label: LabelInput): TransactPutItem => ({
        TableName: Table.BASE,
        Item: this.createNoteLabelDynamoDbItems({ dateNow, noteId, ...label })
    });
}
