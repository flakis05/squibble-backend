import {
    BatchGetCommand,
    BatchGetCommandInput,
    BatchGetCommandOutput,
    BatchWriteCommand,
    BatchWriteCommandInput,
    BatchWriteCommandOutput,
    DynamoDBDocumentClient,
    NativeAttributeValue,
    QueryCommand,
    QueryCommandInput,
    TransactWriteCommand,
    TransactWriteCommandInput
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbException } from '../exceptions/DynamoDbException';
import {
    BasePrimaryKey,
    GSI1PrimaryKey,
    GSI2PrimaryKey,
    OptionalGSI1PrimaryKey,
    OptionalGSI2PrimaryKey
} from '../model/Key';
import { BatchInput, BatchGetItem, BatchWriteItem, BatchWriteType } from './model/BatchInput';
import { BatchGetOutput, BatchItem, BatchOutputBuilder } from './model/BatchGetOutput';
import { ConditionCheck, Delete, Put, Update } from '@aws-sdk/client-dynamodb';
import { DynamoDbItem } from '../model/DynamoDbItem';
import { ItemsNotFoundException } from '../exceptions/ItemsNotFoundException';

export type TransactConditionCheckItem = Omit<ConditionCheck, 'Key' | 'ExpressionAttributeValues'> & {
    Key: Record<string, NativeAttributeValue>;
    ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
};

export type TransactPutItem = Omit<Put, 'Item' | 'ExpressionAttributeValues'> & {
    Item: Record<string, NativeAttributeValue>;
    ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
};
export type TransactDeleteItem = Omit<Delete, 'Key' | 'ExpressionAttributeValues'> & {
    Key: Record<string, NativeAttributeValue>;
    ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
};
export type TransactUpdateItem = Omit<Update, 'Key' | 'ExpressionAttributeValues'> & {
    Key: Record<string, NativeAttributeValue>;
    ExpressionAttributeValues?: Record<string, NativeAttributeValue>;
};

export type QueryPrimaryKey = BasePrimaryKey | GSI1PrimaryKey | GSI2PrimaryKey;

export interface QueryOutput<T extends DynamoDbItem> {
    items: T[];
    lastEvaluatedKey?: BasePrimaryKey | Required<OptionalGSI1PrimaryKey> | Required<OptionalGSI2PrimaryKey>;
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

    public query = async <T extends DynamoDbItem>(input: QueryCommandInput): Promise<QueryOutput<T>> => {
        const { Items, Count, LastEvaluatedKey } = await this.client.send(new QueryCommand(input));

        if (Count === 0) {
            throw new ItemsNotFoundException('Items not found');
        }
        return {
            items: Items as T[],
            lastEvaluatedKey: LastEvaluatedKey as QueryPrimaryKey
        };
    };

    public writeTranscation = async (input: TransactWriteCommandInput): Promise<void> => {
        await this.client.send(new TransactWriteCommand(input));
    };

    public batchGet = async (input: BatchInput<BatchGetItem>): Promise<BatchGetOutput> => {
        this.verifyBatchGetSize(input.items);
        const tableToKeys = this.createTableToBasePrimaryKeyRecord(input.items);
        const batchGetCommandInput = this.createBatchGetCommandInput(tableToKeys);
        const batchGetCommandOutput = await this.client.send(new BatchGetCommand(batchGetCommandInput));
        return this.createBatchGetOutput(batchGetCommandOutput);
    };

    public batchWrite = async (input: BatchInput<BatchWriteItem>): Promise<BatchWriteCommandOutput> => {
        this.verifyBatchWriteSize(input.items);
        const tableToWriteTypeKeys = this.createTableToPutDeleteRecord(input.items);
        const batchWriteCommandInput = this.createBatchWriteCommandInput(tableToWriteTypeKeys);
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
            result[item.table].push(item.attributes);
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
    ): Record<string, Record<BatchWriteType, BatchItem[]>> => {
        const result: Record<string, Record<BatchWriteType, BatchItem[]>> = {};
        items.forEach((item) => {
            if (result[item.table] === undefined) {
                result[item.table] = this.createEmptyPutDeleteRecord();
            }
            result[item.table][item.type].push(item.attributes);
        });
        return result;
    };

    private createBatchWriteCommandInput = (
        tableToWriteTypeKeys: Record<string, Record<BatchWriteType, BatchItem[]>>
    ): BatchWriteCommandInput => {
        const requestItems: BatchWriteCommandInput['RequestItems'] = {};
        Object.entries(tableToWriteTypeKeys).forEach(([table, writeTypeKeys]) => {
            requestItems[table] = [
                ...this.createPutRequestItems(writeTypeKeys),
                ...this.createDeleteRequestItems(writeTypeKeys)
            ];
        });
        return {
            RequestItems: requestItems
        };
    };

    private createBatchGetOutput = (response: BatchGetCommandOutput): BatchGetOutput => {
        if (response['Responses'] === undefined) {
            return new BatchOutputBuilder().build();
        }
        return new BatchOutputBuilder(response['Responses'] as Record<string, BatchItem[]>).build();
    };

    private createDeleteRequestItems = (writeTypeKeys: Record<Extract<BatchWriteType, 'delete'>, BasePrimaryKey[]>) => {
        return Array.from(writeTypeKeys.delete).map((keys) => ({
            DeleteRequest: {
                Key: keys
            }
        }));
    };

    private createPutRequestItems = (writeTypeKeys: Record<Extract<BatchWriteType, 'put'>, BatchItem[]>) => {
        return Array.from(writeTypeKeys.put).map((keys) => ({
            PutRequest: {
                Item: keys
            }
        }));
    };

    private createEmptyPutDeleteRecord = (): Record<BatchWriteType, BatchItem[]> => ({
        put: [],
        delete: []
    });
}
