import { Attribute } from '../../model/Attribute';
import { DynamoDbItem } from '../../model/DynamoDbItem';
import { BasePrimaryKey } from '../../model/Key';

export type BatchWriteType = 'delete' | 'put';

interface BatchItemBase {
    table: string;
    keys: BasePrimaryKey;
}

interface BatchWriteItemBase extends BatchItemBase {
    type: BatchWriteType;
}

interface BatchWriteDeleteItem extends BatchWriteItemBase {
    type: 'delete';
    keys: BasePrimaryKey;
}

interface BatchWritePutItem extends BatchWriteItemBase {
    type: 'put';
    keys: DynamoDbItem & BasePrimaryKey;
}

export type BatchWriteItem = BatchWritePutItem | BatchWriteDeleteItem;
export type BatchGetItem = BatchItemBase;

export interface BatchInput<T extends BatchItemBase> {
    readonly items: T[];
}

export class BatchInputBuilder<T extends BatchItemBase> {
    readonly items: Record<string, T> = {};
    public addItem = (item: T): BatchInputBuilder<T> => {
        this.items[this.createKey(item.keys)] = item;
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
    private createKey = (keys: BasePrimaryKey): string =>
        `${Attribute.PK}#${keys[Attribute.PK]}#${Attribute.SK}#${keys[Attribute.SK]}`;
}
