import {
    BatchGetCommand,
    BatchGetCommandInput,
    BatchGetCommandOutput,
    BatchWriteCommand,
    BatchWriteCommandInput,
    BatchWriteCommandOutput,
    DynamoDBDocumentClient
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbException } from '../exceptions/DynamoDbException';
import { DynamoDbItem } from '../model/DynamoDbItem';
import { BasePrimaryKey } from '../model/Key';

export interface BatchGetItem {
    table: string;
    keys: BasePrimaryKey;
}

type BatchWriteType = 'delete' | 'put';

interface BatchWriteItemBase {
    table: string;
    type: BatchWriteType;
    keys: DynamoDbItem;
}

interface BatchWriteDeleteItem extends BatchWriteItemBase {
    type: 'delete';
    keys: BasePrimaryKey;
}

interface BatchWritePutItem extends BatchWriteItemBase {
    type: 'put';
    keys: DynamoDbItem;
}

export type BatchWriteItem = BatchWritePutItem | BatchWriteDeleteItem;

export interface BatchGetResponse {
    items: Record<string, Record<string, any>[]>;
}

export class AdvancedDynamoDbClientWrapper {
    private client: DynamoDBDocumentClient;
    private maxBatchGetSize: number;
    private maxBatchWriteSize: number;
    constructor(client: DynamoDBDocumentClient, maxBatchGetSize: number, maxBatchWriteSize: number) {
        this.client = client;
        this.maxBatchGetSize = maxBatchGetSize;
        this.maxBatchWriteSize = maxBatchWriteSize;
    }

    public batchGet = async (items: Set<BatchGetItem>): Promise<BatchGetCommandOutput> => {
        this.verifyBatchGetSize(items);
        const keys = this.createTableToBasePrimaryKeyRecord(items);
        const batchGetCommandInput = this.createBatchGetCommandInput(keys);
        return await this.client.send(new BatchGetCommand(batchGetCommandInput));
    };

    public batchWrite = async (items: Set<BatchWriteItem>): Promise<BatchWriteCommandOutput> => {
        this.verifyBatchWriteSize(items);
        const keys = this.createTableToPutDeleteRecord(items);
        const batchWriteCommandInput = this.createBatchWriteCommandInput(keys);
        return await this.client.send(new BatchWriteCommand(batchWriteCommandInput));
    };

    private verifyBatchGetSize = (items: Set<BatchGetItem>) => {
        if (items.size > this.maxBatchGetSize) {
            throw new DynamoDbException(`Batch get size is over max limit: ${this.maxBatchGetSize}`);
        }
    };

    private verifyBatchWriteSize = (items: Set<BatchWriteItem>) => {
        if (items.size > this.maxBatchWriteSize) {
            throw new DynamoDbException(`Batch write size is over max limit: ${this.maxBatchWriteSize}`);
        }
    };

    private createTableToBasePrimaryKeyRecord = (items: Set<BatchGetItem>): Record<string, Set<BasePrimaryKey>> => {
        const result: Record<string, Set<BasePrimaryKey>> = {};
        items.forEach((item) => {
            if (result[item.table] === undefined) {
                result[item.table] = new Set();
            }
            result[item.table].add(item.keys);
        });
        return result;
    };

    private createBatchGetCommandInput = (tableToKeys: Record<string, Set<DynamoDbItem>>): BatchGetCommandInput => {
        const requestItems: BatchGetCommandInput['RequestItems'] = {};
        Object.entries(tableToKeys).forEach(([table, keys]) => {
            requestItems[table] = {
                Keys: Array.from(keys)
            };
        });
        return {
            RequestItems: requestItems
        };
    };

    private createTableToPutDeleteRecord = (
        items: Set<BatchWriteItem>
    ): Record<string, Record<BatchWriteType, Set<DynamoDbItem>>> => {
        const result: Record<string, Record<BatchWriteType, Set<DynamoDbItem>>> = {};
        items.forEach((item) => {
            if (result[item.table] === undefined) {
                result[item.table] = this.createEmptyPutDeleteRecord();
            }
            result[item.table][item.type].add(item.keys);
        });
        return result;
    };

    private createBatchWriteCommandInput = (
        tableToTypeKeys: Record<string, Record<BatchWriteType, Set<DynamoDbItem>>>
    ): BatchWriteCommandInput => {
        const requestItems: BatchWriteCommandInput['RequestItems'] = {};
        Object.entries(tableToTypeKeys).forEach(([table, typeKeys]) => {
            requestItems[table] = [...this.createPutRequestItems(typeKeys), ...this.createDeleteRequestItems(typeKeys)];
        });
        return {
            RequestItems: requestItems
        };
    };

    private createDeleteRequestItems = (typeKeys: Record<BatchWriteType, Set<DynamoDbItem>>) => {
        return Array.from(typeKeys.delete).map((keys) => ({
            DeleteRequest: {
                Key: keys
            }
        }));
    };

    private createPutRequestItems = (typeKeys: Record<BatchWriteType, Set<DynamoDbItem>>) => {
        return Array.from(typeKeys.put).map((keys) => ({
            PutRequest: {
                Item: keys
            }
        }));
    };

    private createEmptyPutDeleteRecord = (): Record<BatchWriteType, Set<DynamoDbItem>> => ({
        put: new Set(),
        delete: new Set()
    });
}
