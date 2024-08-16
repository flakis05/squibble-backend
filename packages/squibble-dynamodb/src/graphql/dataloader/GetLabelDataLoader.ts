import { Errorable, Nullable } from '../../api/model';
import { BatchGetOutput, BatchItem } from '../../dynamodb/wrapper/model/BatchGetOutput';
import { BatchGetItem, BatchInputBuilder } from '../../dynamodb/wrapper/model/BatchInput';
import { GetLabelInput, GetLabelOutput } from '../api/label/model';
import { AdvancedDynamoDbClientWrapper } from '../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DataLoader } from '../util/Dataloader';
import { Table } from '../../dynamodb/model/Table';
import { createLabelBasePrimaryKey } from '../../dynamodb/key/label-key-factory';
import { NotFoundException } from '../../api/exceptions/NotFoundException';
import { fromDynamoDbItem } from '../api/label/factory/label-factory';
import { LabelDynamoDbItem } from '../../dynamodb/model/Label';

export class GetLabelDataLoader implements DataLoader<GetLabelInput, GetLabelOutput> {
    private client: AdvancedDynamoDbClientWrapper;
    constructor(client: AdvancedDynamoDbClientWrapper) {
        this.client = client;
    }

    public load = async (keys: readonly GetLabelInput[]): Promise<Errorable<GetLabelOutput>[]> => {
        const items: BatchGetItem[] = keys.map(this.createBatchGetItem);
        const result: BatchGetOutput = await this.client.batchGet(new BatchInputBuilder().addItems(items).build());
        return keys.map((key) => this.mapToLabelEntity(key, result));
    };

    private createBatchGetItem = (input: GetLabelInput): BatchGetItem => ({
        table: Table.BASE,
        attributes: createLabelBasePrimaryKey(input.labelId)
    });

    private mapToLabelEntity = (key: GetLabelInput, result: BatchGetOutput): Errorable<GetLabelOutput> => {
        const item: Nullable<BatchItem> = result.getItem(Table.BASE, createLabelBasePrimaryKey(key.labelId));
        if (item === null) {
            return new NotFoundException('Entity not found');
        }
        return {
            label: fromDynamoDbItem(item as LabelDynamoDbItem)
        };
    };
}
