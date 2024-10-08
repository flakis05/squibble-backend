import { createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';
import { LabelDynamoDbItem, LabelsAttributeValue } from '../../../dynamodb/model/Label';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { Table } from '../../../dynamodb/model/Table';
import { AdvancedDynamoDbClientWrapper } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { fromDynamoDbItem as fromDynamoDbItemToNoteEntity } from '../../api/note/factory/note-factory';
import { fromDynamoDbItem as fromDynamoDbItemToLabelEntity } from '../../api/label/factory/label-factory';
import { GetNoteInput, GetNoteOutput, NoteEntity } from '../../api/note/model';
import { ApiCallHandler } from '../ApiCallHandler';
import { LabelEntity } from '../../api/label/model';
import { BatchGetItem, BatchInput, BatchInputBuilder } from '../../../dynamodb/wrapper/model/BatchInput';
import { BatchGetOutput } from '../../../dynamodb/wrapper/model/BatchGetOutput';
import { NotFoundException } from '../../exception/NotFoundException';

export class GetNoteHandler implements ApiCallHandler<GetNoteInput, GetNoteOutput> {
    private client: DynamoDBClientWrapper;
    private advancedClient: AdvancedDynamoDbClientWrapper;
    constructor(client: DynamoDBClientWrapper, advancedClient: AdvancedDynamoDbClientWrapper) {
        this.client = client;
        this.advancedClient = advancedClient;
    }
    //[TODO]: Handle the case when this.resolveNoteLabels fails to get some labels
    public handle = async (input: GetNoteInput): Promise<GetNoteOutput> => {
        const key = createNoteBasePrimaryKey(input.noteId);
        const { item } = await this.client.get<NoteDynamoDbItem>(key);
        this.verifyStatusOfNote(item, input);
        const entity = fromDynamoDbItemToNoteEntity(item);
        await this.resolveNoteLabels(entity, item);
        return {
            note: entity
        };
    };

    private verifyStatusOfNote = (item: NoteDynamoDbItem, input: GetNoteInput) => {
        if (input.status == 'active' && !this.isActive(item)) {
            throw new NotFoundException('Entity not found');
        } else if (input.status == 'archived' && !this.isArchived(item)) {
            throw new NotFoundException('Entity not found');
        } else if (input.status == 'deleted' && !this.isDeleted(item)) {
            throw new NotFoundException('Entity not found');
        }
    };

    private isArchived = (item: NoteDynamoDbItem) => {
        return item.archivedAt !== undefined;
    };

    private isDeleted = (item: NoteDynamoDbItem) => {
        return item.deletedAt !== undefined;
    };

    private isActive = (item: NoteDynamoDbItem) => {
        return !this.isArchived(item) && !this.isDeleted(item);
    };

    private getLabelDynamoDbItems = async (overrideLabels: LabelsAttributeValue): Promise<BatchGetOutput> => {
        const batchGetItems = this.createBatchGetItems(overrideLabels);
        return await this.advancedClient.batchGet(batchGetItems);
    };

    private createBatchGetItems = (overrideLabels: LabelsAttributeValue): BatchInput<BatchGetItem> => {
        const batchGetItems: BatchGetItem[] = Object.values(overrideLabels).map((label) => ({
            table: Table.BASE,
            attributes: createLabelBasePrimaryKey(label.labelId)
        }));

        return new BatchInputBuilder<BatchGetItem>().addItems(batchGetItems).build();
    };

    private createNoteLabels = (
        labelOverrides: LabelsAttributeValue,
        batchGetOutput: BatchGetOutput
    ): LabelEntity[] => {
        return Object.values(labelOverrides).map((labelOverride) => {
            const label = batchGetOutput.getItem(
                Table.BASE,
                createLabelBasePrimaryKey(labelOverride.labelId)
            ) as LabelDynamoDbItem;
            return fromDynamoDbItemToLabelEntity(label, labelOverride);
        });
    };

    private resolveNoteLabels = async (entity: NoteEntity, item: NoteDynamoDbItem): Promise<void> => {
        if (Object.keys(item[Attribute.LABELS]).length !== 0) {
            const batchGetOutput = await this.getLabelDynamoDbItems(item[Attribute.LABELS]);
            entity.labels = this.createNoteLabels(item[Attribute.LABELS], batchGetOutput);
        } else {
            entity.labels = [];
        }
    };
}
