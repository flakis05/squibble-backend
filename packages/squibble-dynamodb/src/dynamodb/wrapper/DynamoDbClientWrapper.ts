import {
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    NativeAttributeValue,
    PutCommand,
    PutCommandInput
} from '@aws-sdk/lib-dynamodb';

import { ItemNotFoundException } from '../exceptions/ItemNotFoundException';
import { DynamoDbItem } from '../model/DynamoDbItem';

export type Key = Record<string, NativeAttributeValue>;

export interface GetOutput<T extends DynamoDbItem> {
    item: T;
}

export class DynamoDBClientWrapper {
    private tableName: string;
    private client: DynamoDBDocumentClient;
    constructor(tableName: string, client: DynamoDBDocumentClient) {
        this.tableName = tableName;
        this.client = client;
    }

    public get = async <T extends DynamoDbItem>(key: Key): Promise<GetOutput<T>> => {
        const input: GetCommandInput = {
            TableName: this.tableName,
            Key: key
        };
        const { Item } = await this.client.send(new GetCommand(input));

        if (Item === undefined) {
            throw new ItemNotFoundException('Item not found');
        }
        return {
            item: Item as T
        };
    };

    public create = async <T extends DynamoDbItem>(entity: T): Promise<void> => {
        const input: PutCommandInput = {
            TableName: this.tableName,
            Item: entity
        };
        await this.client.send(new PutCommand(input));
    };
}
