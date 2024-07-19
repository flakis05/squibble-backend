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
import { BatchInput, BatchGetItem, BatchWriteItem, BatchWriteType } from './model/BatchInput';

export class AdvancedDynamoDbClientWrapper {
    private client: DynamoDBDocumentClient;
    private maxBatchGetSize: number;
    private maxBatchWriteSize: number;
    constructor(client: DynamoDBDocumentClient, maxBatchGetSize: number, maxBatchWriteSize: number) {
        this.client = client;
        this.maxBatchGetSize = maxBatchGetSize;
        this.maxBatchWriteSize = maxBatchWriteSize;
    }

    public batchGet = async (input: BatchInput<BatchGetItem>): Promise<BatchGetCommandOutput> => {
        this.verifyBatchGetSize(input.items);
        const keys = this.createTableToBasePrimaryKeyRecord(input.items);
        const batchGetCommandInput = this.createBatchGetCommandInput(keys);
        return await this.client.send(new BatchGetCommand(batchGetCommandInput));
    };

    public batchWrite = async (input: BatchInput<BatchWriteItem>): Promise<BatchWriteCommandOutput> => {
        this.verifyBatchWriteSize(input.items);
        const keys = this.createTableToPutDeleteRecord(input.items);
        const batchWriteCommandInput = this.createBatchWriteCommandInput(keys);
        return await this.client.send(new BatchWriteCommand(batchWriteCommandInput));
    };

    private verifyBatchGetSize = (items: BatchGetItem[]) => {
        if (items.length > this.maxBatchGetSize) {
            throw new DynamoDbException(`Batch get size is over max limit: ${this.maxBatchGetSize}`);
        }
    };

    private verifyBatchWriteSize = (items: BatchWriteItem[]) => {
        if (items.length > this.maxBatchWriteSize) {
            throw new DynamoDbException(`Batch write size is over max limit: ${this.maxBatchWriteSize}`);
        }
    };

    private createTableToBasePrimaryKeyRecord = (items: BatchGetItem[]): Record<string, BasePrimaryKey[]> => {
        const result: Record<string, BasePrimaryKey[]> = {};
        items.forEach((item) => {
            if (result[item.table] === undefined) {
                result[item.table] = [];
            }
            result[item.table].push(item.keys);
        });
        return result;
    };

    private createBatchGetCommandInput = (tableToKeys: Record<string, BasePrimaryKey[]>): BatchGetCommandInput => {
        const requestItems: BatchGetCommandInput['RequestItems'] = {};
        Object.entries(tableToKeys).forEach(([table, keys]) => {
            requestItems[table] = {
                Keys: keys
            };
        });
        return {
            RequestItems: requestItems
        };
    };

    private createTableToPutDeleteRecord = (
        items: BatchWriteItem[]
    ): Record<string, Record<BatchWriteType, (DynamoDbItem & BasePrimaryKey)[]>> => {
        const result: Record<string, Record<BatchWriteType, (DynamoDbItem & BasePrimaryKey)[]>> = {};
        items.forEach((item) => {
            if (result[item.table] === undefined) {
                result[item.table] = this.createEmptyPutDeleteRecord();
            }
            result[item.table][item.type].push(item.keys);
        });
        return result;
    };

    private createBatchWriteCommandInput = (
        tableToTypeKeys: Record<string, Record<BatchWriteType, (DynamoDbItem & BasePrimaryKey)[]>>
    ): BatchWriteCommandInput => {
        const requestItems: BatchWriteCommandInput['RequestItems'] = {};
        Object.entries(tableToTypeKeys).forEach(([table, typeKeys]) => {
            requestItems[table] = [...this.createPutRequestItems(typeKeys), ...this.createDeleteRequestItems(typeKeys)];
        });
        return {
            RequestItems: requestItems
        };
    };

    private createDeleteRequestItems = (typeKeys: Record<Extract<BatchWriteType, 'delete'>, BasePrimaryKey[]>) => {
        return Array.from(typeKeys.delete).map((keys) => ({
            DeleteRequest: {
                Key: keys
            }
        }));
    };

    private createPutRequestItems = (
        typeKeys: Record<Extract<BatchWriteType, 'put'>, (DynamoDbItem & BasePrimaryKey)[]>
    ) => {
        return Array.from(typeKeys.put).map((keys) => ({
            PutRequest: {
                Item: keys
            }
        }));
    };

    private createEmptyPutDeleteRecord = (): Record<BatchWriteType, (DynamoDbItem & BasePrimaryKey)[]> => ({
        put: [],
        delete: []
    });
}
