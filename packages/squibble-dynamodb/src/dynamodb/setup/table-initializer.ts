import {
    CreateTableCommand,
    CreateTableCommandInput,
    DescribeTableCommandInput,
    KeyType,
    ScalarAttributeType,
    waitUntilTableExists
} from '@aws-sdk/client-dynamodb';
import { client } from '../client';
import { Attribute } from '../model/Attribute';

export const initializeDynamoDbTable = async (tableName: string): Promise<void> => {
    console.log('Initializing DynamoDb Tables');
    const createTableCommandInput: CreateTableCommandInput = createTableRequest(tableName);
    const describeTableCommandInput: DescribeTableCommandInput = { TableName: tableName };
    try {
        await client.send(new CreateTableCommand(createTableCommandInput));
        await waitUntilTableExists({ client, maxWaitTime: 30 }, describeTableCommandInput);
        console.log('Initialized DynamoDb Tables');
    } catch (e) {
        if (e instanceof Error) {
            console.log(e.message);
        }
    }
};

const createTableRequest = (tableName: string): CreateTableCommandInput => ({
    TableName: tableName,
    AttributeDefinitions: [
        {
            AttributeName: Attribute.PK,
            AttributeType: ScalarAttributeType.S
        },
        {
            AttributeName: Attribute.SK,
            AttributeType: ScalarAttributeType.S
        }
    ],
    KeySchema: [
        {
            AttributeName: Attribute.PK,
            KeyType: KeyType.HASH
        },
        {
            AttributeName: Attribute.SK,
            KeyType: KeyType.RANGE
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
});
