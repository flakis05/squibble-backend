import { DynamoDbItem } from '../../model/DynamoDbItem';
import { BasePrimaryKey } from '../../model/Key';
import { createBatchItemId } from './util';

export type BatchWriteType = 'delete' | 'put';

interface BatchItemBase {
    table: string;
    attributes: BasePrimaryKey;
}

interface BatchWriteItemBase extends BatchItemBase {
    type: BatchWriteType;
}

interface BatchWriteDeleteItem extends BatchWriteItemBase {
    type: 'delete';
    attributes: BasePrimaryKey;
}

interface BatchWritePutItem extends BatchWriteItemBase {
    type: 'put';
    attributes: DynamoDbItem & BasePrimaryKey;
}

export type BatchWriteItem = BatchWritePutItem | BatchWriteDeleteItem;
export type BatchGetItem = BatchItemBase;

export interface BatchInput<T extends BatchItemBase> {
    readonly items: T[];
}

export class BatchInputBuilder<T extends BatchItemBase> {
    private readonly items: Record<string, T> = {};
    public addItem = (item: T): BatchInputBuilder<T> => {
        this.items[createBatchItemId(item.attributes)] = item;
        return this;
    };
    public addItems = (items: T[]): BatchInputBuilder<T> => {
        items.forEach(this.addItem);
        return this;
    };
    public build = (): BatchInput<T> => {
        return {
            items: Object.values(this.items)
        };
    };
}
