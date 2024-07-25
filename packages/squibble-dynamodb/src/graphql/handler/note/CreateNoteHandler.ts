import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { WithDateNow } from '../../../api/model';
import { createNoteBasePrimaryKey as createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { createNoteLabelBasePrimaryKey as createNoteLabelBasePrimaryKey } from '../../../dynamodb/key/note-label-key-factory';
import { KeySupplier } from '../../util/KeySupplier';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { fromDynamoDbItem } from '../../api/note/factory/note-factory';
import { CreateNoteInput, CreateNoteOutput, NoteId } from '../../api/note/model';
import { NoteLabelDynamoDbItem } from '../../../dynamodb/model/NoteLabel';
import { AdvancedDynamoDbClientWrapper } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { Table } from '../../../dynamodb/model/Table';
import { LabelsAttributeValue } from '../../../dynamodb/model/Label';
import { AddLabelInput } from '../../api/label/model';
import { BatchInput, BatchInputBuilder, BatchWriteItem } from '../../../dynamodb/wrapper/model/BatchInput';

export class CreateNoteHandler implements ApiCallHandler<CreateNoteInput, CreateNoteOutput> {
    private client: AdvancedDynamoDbClientWrapper;
    private keySupplier: KeySupplier;
    constructor(client: AdvancedDynamoDbClientWrapper, keySupplier: KeySupplier) {
        this.client = client;
        this.keySupplier = keySupplier;
    }
    public handle = async (input: CreateNoteInput): Promise<CreateNoteOutput> => {
        const dateNow = new Date().toISOString();
        const noteId = this.keySupplier.get();
        const noteDynamoDbItem = this.createNoteDynamoDbItem({ dateNow, noteId, ...input });
        const noteLabelDynamoDbItems = this.createNoteLabelDynamoDbItems({ dateNow, noteId, ...input });
        const batchInput = this.createBatchInput([noteDynamoDbItem, ...noteLabelDynamoDbItems]);
        await this.client.batchWrite(batchInput);

        return {
            note: fromDynamoDbItem(noteDynamoDbItem)
        };
    };

    private createNoteDynamoDbItem = (input: WithDateNow<CreateNoteInput & NoteId>): NoteDynamoDbItem => {
        const note: NoteDynamoDbItem = {
            ...createNoteBasePrimaryKey(input.noteId),
            createdAt: input.dateNow,
            modifiedAt: input.dateNow,
            noteId: input.noteId,
            title: input.title,
            content: input.content,
            labels: {}
        };
        if (input.labels !== undefined) {
            note.labels = this.createNoteLabelsDynamoDbItem({ dateNow: input.dateNow, labels: input.labels });
        }
        return note;
    };

    private createNoteLabelsDynamoDbItem = (
        input: WithDateNow<Required<Pick<CreateNoteInput, 'labels'>>>
    ): LabelsAttributeValue => {
        return input.labels.reduce((acc, curr: AddLabelInput) => {
            acc[curr.labelId] = {
                labelId: curr.labelId,
                color: curr.color,
                addedAt: input.dateNow
            };
            return acc;
        }, {} as LabelsAttributeValue);
    };

    private createNoteLabelDynamoDbItems = (
        input: WithDateNow<Pick<CreateNoteInput, 'labels'> & NoteId>
    ): NoteLabelDynamoDbItem[] => {
        if (input.labels === undefined) {
            return [];
        }
        return input.labels.map((label) => ({
            ...createNoteLabelBasePrimaryKey(input.noteId, label.labelId),
            createdAt: input.dateNow,
            noteId: input.noteId,
            labelId: label.labelId
        }));
    };

    private createBatchInput = (items: (NoteDynamoDbItem | NoteLabelDynamoDbItem)[]): BatchInput<BatchWriteItem> => {
        const batchWriteItems: BatchWriteItem[] = items.map((item) => ({
            table: Table.BASE,
            type: 'put',
            attributes: item
        }));

        return new BatchInputBuilder<BatchWriteItem>().addItems(batchWriteItems).build();
    };
}
