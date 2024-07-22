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
import { initializeItemsInTable } from './table-item-initializer';
import { CreateLabelInput, CreateLabelOutput } from '../../graphql/api/label/model';
import { CreateNoteInput, CreateNoteOutput } from '../../graphql/api/note/model';
import { ApiCallHandler } from '../../graphql/handler/ApiCallHandler';

export const initializeDynamoDbTable = async (
    tableName: string,
    createNoteHandler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>,
    createLabelHandler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>
): Promise<void> => {
    console.log('Initializing DynamoDb tables');
    const createTableCommandInput: CreateTableCommandInput = createTableRequest(tableName);
    const describeTableCommandInput: DescribeTableCommandInput = { TableName: tableName };
    try {
        await client.send(new CreateTableCommand(createTableCommandInput));
        await waitUntilTableExists({ client, maxWaitTime: 30 }, describeTableCommandInput);
        initializeItemsInTable(createNoteHandler, createLabelHandler);
        console.log('Initialized DynamoDb tables');
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
