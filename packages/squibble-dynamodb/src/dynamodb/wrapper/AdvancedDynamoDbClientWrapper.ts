import {
    BatchGetCommand,
    BatchGetCommandInput,
    BatchGetCommandOutput,
    DynamoDBDocumentClient,
    NativeAttributeValue
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbException } from '../exceptions/DynamoDbException';

export type Key = Record<string, NativeAttributeValue>;

export interface BatchGetItem {
    table: string;
    key: Key;
}

export interface BatchGetResponse {
    items: Record<string, Record<string, any>[]>;
}

export class AdvancedDynamoDbClientWrapper {
    private client: DynamoDBDocumentClient;
    private maxBatchSize: number;
    constructor(client: DynamoDBDocumentClient, maxBatchSize: number) {
        this.client = client;
        this.maxBatchSize = maxBatchSize;
    }

    public batchGet = async (items: Set<BatchGetItem>): Promise<BatchGetResponse> => {
        const keys: Map<string, Set<Key>> = this.createTableToKeyMap(items);
        this.verifyBatchSize(this.getTotalSize(keys));
        const batchGetCommandInput = this.createBatchGetCommandInput(keys);
        const batchGetCommandOutput = await this.client.send(new BatchGetCommand(batchGetCommandInput));
        const batchGetResponse = this.createBatchGetResponse(batchGetCommandOutput);
        return batchGetResponse;
    };

    private verifyBatchSize = (batchTotalSize: number) => {
        if (batchTotalSize > this.maxBatchSize) {
            throw new DynamoDbException(`Batch size is over max limit: ${this.maxBatchSize}`);
        }
    };

    private getTotalSize(keys: Map<string, Set<Key>>) {
        return Array.from(keys.values()).reduce((total, set) => total + set.size, 0);
    }

    private createTableToKeyMap = (items: Set<BatchGetItem>): Map<string, Set<Key>> => {
        const result = new Map<string, Set<Key>>();
        items.forEach((item) => {
            const keys: Set<Key> = result.get(item.table) || new Set();
            if (keys.size === 0) {
                result.set(item.table, keys);
            }
            keys.add(item.key);
        });
        return result;
    };

    private createBatchGetCommandInput = (keys: Map<string, Set<Key>>): BatchGetCommandInput => {
        const requestItems: BatchGetCommandInput['RequestItems'] = {};
        keys.forEach((value, key) => {
            requestItems[key] = {
                Keys: Array.from(value)
            };
        });
        return {
            RequestItems: requestItems
        };
    };

    private createBatchGetResponse = (batchGetCommandOutput: BatchGetCommandOutput): BatchGetResponse => {
        if (batchGetCommandOutput.Responses === undefined) {
            return {
                items: {}
            };
        }
        return {
            items: batchGetCommandOutput.Responses
        };
    };
}
