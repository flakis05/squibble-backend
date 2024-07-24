import {
    CreateTableCommand,
    CreateTableCommandInput,
    DescribeTableCommandInput,
    KeyType,
    ProjectionType,
    ScalarAttributeType,
    waitUntilTableExists
} from '@aws-sdk/client-dynamodb';
import { client } from '../client';
import { Attribute } from '../model/Attribute';
import { initializeItemsInTable } from './table-item-initializer';
import { CreateLabelInput, CreateLabelOutput } from '../../graphql/api/label/model';
import { CreateNoteInput, CreateNoteOutput } from '../../graphql/api/note/model';
import { ApiCallHandler } from '../../graphql/handler/ApiCallHandler';
import { Index, Table } from '../model/Table';

export const initializeDynamoDbTable = async (
    createNoteHandler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>,
    createLabelHandler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>
): Promise<void> => {
    console.log('Initializing DynamoDb tables');
    const createTableCommandInput: CreateTableCommandInput = createTableRequest();
    const describeTableCommandInput: DescribeTableCommandInput = { TableName: Table.BASE };
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

const createTableRequest = (): CreateTableCommandInput => ({
    TableName: Table.BASE,
    AttributeDefinitions: [
        {
            AttributeName: Attribute.PK,
            AttributeType: ScalarAttributeType.S
        },
        {
            AttributeName: Attribute.SK,
            AttributeType: ScalarAttributeType.S
        },
        {
            AttributeName: Attribute.GSI1_PK,
            AttributeType: ScalarAttributeType.S
        },
        {
            AttributeName: Attribute.GSI1_SK,
            AttributeType: ScalarAttributeType.S
        },

        {
            AttributeName: Attribute.GSI2_PK,
            AttributeType: ScalarAttributeType.S
        },
        {
            AttributeName: Attribute.GSI2_SK,
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
    },
    GlobalSecondaryIndexes: [
        {
            IndexName: Index.ONE,
            KeySchema: [
                {
                    AttributeName: Attribute.GSI1_PK,
                    KeyType: KeyType.HASH
                },
                {
                    AttributeName: Attribute.GSI1_SK,
                    KeyType: KeyType.RANGE
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
            Projection: {
                ProjectionType: ProjectionType.ALL
            }
        },
        {
            IndexName: Index.TWO,
            KeySchema: [
                {
                    AttributeName: Attribute.GSI2_PK,
                    KeyType: KeyType.HASH
                },
                {
                    AttributeName: Attribute.GSI2_SK,
                    KeyType: KeyType.RANGE
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            },
            Projection: {
                ProjectionType: ProjectionType.ALL
            }
        }
    ]
});
