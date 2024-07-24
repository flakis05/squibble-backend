import { ApiCallHandler } from '../ApiCallHandler';
import { AddLabelToNoteInput, AddLabelToNoteOutput, NoteId } from '../../api/note/model';
import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { WithDateNow } from '../../../api/model';
import { BasePrimaryKey } from '../../../dynamodb/model/Key';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { AdvancedDynamoDbClientWrapper } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { Table } from '../../../dynamodb/model/Table';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { attributeExists, createUpdateExpression } from '../../../dynamodb/util/expression-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';
import { createNoteLabelBasePrimaryKey } from '../../../dynamodb/key/note-label-key-factory';
import { CreateNoteWithLabelInput } from '../../api/label/model';
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
                    ConditionCheck: {
                        TableName: Table.BASE,
                        Key: createLabelBasePrimaryKey(label.labelId),
                        ConditionExpression: attributeExists(Attribute.PK)
                    }
                },
                {
                    Update: {
                        TableName: Table.BASE,
                        Key: createNoteBasePrimaryKey(noteId),
                        ...createUpdateExpression(noteDynamoDbItem)
                    }
                },
                {
                    Put: {
                        TableName: Table.BASE,
                        Item: this.createNoteLabelDynamoDbItems({ dateNow, noteId, ...label })
                    }
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
        input: WithDateNow<CreateNoteWithLabelInput>
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

    private createNoteLabelDynamoDbItems = (
        input: WithDateNow<CreateNoteWithLabelInput & NoteId>
    ): NoteLabelDynamoDbItem => ({
        ...createNoteLabelBasePrimaryKey(input.noteId, input.labelId),
        noteId: input.noteId,
        labelId: input.labelId,
        createdAt: input.dateNow
    });
}
