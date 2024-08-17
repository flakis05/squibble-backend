import {
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
    UpdateCommand,
    UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';

import { ItemNotFoundException } from '../exceptions/ItemNotFoundException';
import { DynamoDbItem } from '../model/DynamoDbItem';
import { BasePrimaryKey } from '../model/Key';
import { createUpdateExpression } from '../util/expression-factory';
import { NullableObjectValues } from '../../api/model';

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

    public get = async <T extends DynamoDbItem>(key: BasePrimaryKey): Promise<GetOutput<T>> => {
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

    public update = async <T extends DynamoDbItem>(
        key: BasePrimaryKey,
        entity: NullableObjectValues<Omit<T, keyof BasePrimaryKey>>
    ): Promise<void> => {
        const { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } =
            createUpdateExpression<T>(entity);
        const input: UpdateCommandInput = {
            TableName: this.tableName,
            Key: key,
            UpdateExpression,
            ExpressionAttributeNames,
            ExpressionAttributeValues
        };
        await this.client.send(new UpdateCommand(input));
    };
}
