import { createBasePrimaryKey as createNoteBasePrimaryKey } from '../../../dynamodb/key/note-key-factory';
import { createBasePrimaryKey as createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
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

export class GetNoteHandler implements ApiCallHandler<GetNoteInput, GetNoteOutput> {
    private client: DynamoDBClientWrapper;
    private advancedClient: AdvancedDynamoDbClientWrapper;
    constructor(client: DynamoDBClientWrapper, advancedClient: AdvancedDynamoDbClientWrapper) {
        this.client = client;
        this.advancedClient = advancedClient;
    }
    //[TODO]: Handle the case when this.getLabels fails to get some labels
    public handle = async (input: GetNoteInput): Promise<GetNoteOutput> => {
        const key = createNoteBasePrimaryKey(input.noteId);
        const { item } = await this.client.get<NoteDynamoDbItem>(key);
        const entity = fromDynamoDbItemToNoteEntity(item);
        await this.resolveNoteLabels(entity, item);
        return {
            note: entity
        };
    };

    private getLabels = async (overrideLabels: LabelsAttributeValue): Promise<LabelEntity[]> => {
        const batchGetItems = this.createBatchGetItems(overrideLabels);
        const batchGetOutput = await this.advancedClient.batchGet(batchGetItems);
        return this.createNoteLabels(overrideLabels, batchGetOutput);
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
        if (item[Attribute.LABELS]) {
            entity.labels = await this.getLabels(item[Attribute.LABELS]);
        }
    };
}
