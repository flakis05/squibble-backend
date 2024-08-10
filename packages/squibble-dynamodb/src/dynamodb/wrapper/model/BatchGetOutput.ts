import { Nullable } from '../../../api/model';
import { DynamoDbItem } from '../../model/DynamoDbItem';
import { BasePrimaryKey } from '../../model/Key';
import { createBatchItemId } from './util';

export type BatchItem = DynamoDbItem & BasePrimaryKey;
type BatchItems = Record<string, BatchItem>;

export class BatchGetOutput {
    readonly items: Record<string, BatchItems>;

    constructor(items: Record<string, BatchItems>) {
        this.items = items;
    }

    public getItem = (table: string, key: BasePrimaryKey): Nullable<BatchItem> => {
        const itemKey = createBatchItemId(key);
        return this.items[table]?.[itemKey] ?? null;
    };

    public getItems = (table: string): Nullable<BatchItems> => {
        return this.items[table] ?? null;
    };
}

export class BatchOutputBuilder {
    private readonly items: Record<string, BatchItems> = {};
    constructor(items?: Record<string, BatchItem[]>) {
        if (items) {
            Object.entries(items).forEach(([table, batchItems]) => this.addItems(table, batchItems));
        }
    }

    public addItem = (table: string, item: BatchItem): BatchOutputBuilder => {
        if (this.items[table] === undefined) {
            this.items[table] = {};
        }
        this.items[table][createBatchItemId(item)] = item;
        return this;
    };
    public addItems = (table: string, items: BatchItem[]): BatchOutputBuilder => {
        items.forEach((item) => this.addItem(table, item));
        return this;
    };

    public build = (): BatchGetOutput => {
        return new BatchGetOutput(this.items);
    };
}
