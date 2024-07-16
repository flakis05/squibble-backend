import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { WithDateNow } from '../../../api/model';
import { buildBasePrimaryKey as buildNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { buildBasePrimaryKey as buildNoteLabelBasePrimaryKey } from '../../../dynamodb/key/note-label-key-factory';
import { KeySupplier } from '../../util/KeySupplier';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { fromDynamoDbItem } from '../../api/note/factory/note-factory';
import { CreateNoteInput, CreateNoteOutput, NoteId } from '../../api/note/model';
import { NoteLabelDynamoDbItem } from '../../../dynamodb/model/NoteLabel';
import { AdvancedDynamoDbClientWrapper, BatchWriteItem } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { Table } from '../../../dynamodb/model/Table';

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
        const batchWriteItems = this.createBatchWriteItems([noteDynamoDbItem, ...noteLabelDynamoDbItems]);
        await this.client.batchWrite(batchWriteItems);

        return {
            note: fromDynamoDbItem(noteDynamoDbItem)
        };
    };

    private createNoteDynamoDbItem = (input: WithDateNow<CreateNoteInput & NoteId>): NoteDynamoDbItem => {
        return {
            ...buildNoteBasePrimaryKey(input.noteId),
            createdAt: input.dateNow,
            modifiedAt: input.dateNow,
            noteId: input.noteId,
            title: input.title,
            content: input.content
        };
    };

    private createNoteLabelDynamoDbItems = (
        input: WithDateNow<Pick<CreateNoteInput, 'labels'> & NoteId>
    ): NoteLabelDynamoDbItem[] => {
        if (input.labels === undefined) {
            return [];
        }
        return input.labels.map((label) => ({
            ...buildNoteLabelBasePrimaryKey(input.noteId, label.labelId),
            createdAt: input.dateNow,
            noteId: input.noteId,
            labelId: label.labelId
        }));
    };

    private createBatchWriteItems = (items: DynamoDbItem[]): Set<BatchWriteItem> => {
        const batchWriteItems: BatchWriteItem[] = items.map((item) => ({
            table: Table.BASE,
            type: 'put',
            keys: item
        }));

        return new Set(batchWriteItems);
    };
}
