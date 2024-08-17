import { ItemsNotFoundException } from '../../../dynamodb/exceptions/ItemsNotFoundException';
import {
    Connection,
    LastEvaluatedKeySupplier,
    QueryInputSupplier,
    QueryRequestInput,
    QueryRequestOutput
} from '../../api/shared/model';
import { ApiCallHandler } from '../ApiCallHandler';
import {
    AdvancedDynamoDbClientWrapper,
    QueryPrimaryKey
} from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { Base64Encoder } from '../../util/Base64Encoder';
import { DynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

interface QueryResult<T extends DynamoDbItem> {
    items: T[];
    lastEvaluatedKey?: QueryPrimaryKey;
}

export class QueryHandler implements ApiCallHandler<QueryRequestInput<DynamoDbItem>, QueryRequestOutput<DynamoDbItem>> {
    private client: AdvancedDynamoDbClientWrapper;
    private base64Encoder: Base64Encoder;
    constructor(client: AdvancedDynamoDbClientWrapper, base64Encoder: Base64Encoder) {
        this.client = client;
        this.base64Encoder = base64Encoder;
    }
    public handle = async <T extends DynamoDbItem>(input: QueryRequestInput<T>): Promise<Connection<T>> => {
        try {
            const { items, lastEvaluatedKey } = await this.queryAndPaginateToLimit<T>(
                input.queryInputSupplier,
                input.limit,
                input.after
            );

            if (items.length < input.limit) {
                return this.createConnection(false, items, input.lastEvaluatedKeySupplier);
            }
            return this.createConnection(
                this.hasNextPage<T>(input.limit, items, lastEvaluatedKey),
                items.slice(0, input.limit),
                input.lastEvaluatedKeySupplier
            );
        } catch (error) {
            if (error instanceof ItemsNotFoundException) {
                return this.createEmptyConnection<T>();
            }
            throw error;
        }
    };

    private queryAndPaginateToLimit = async <T extends DynamoDbItem>(
        queryInputSupplier: QueryInputSupplier,
        limit: number,
        after?: string
    ): Promise<QueryResult<T>> => {
        let lastEvaluatedKey = after !== undefined ? this.base64Encoder.decode<QueryPrimaryKey>(after) : undefined;
        const result: T[] = [];
        do {
            const queryOutput = await this.client.query<T>(queryInputSupplier(lastEvaluatedKey));
            result.push(...queryOutput.items);
            lastEvaluatedKey = queryOutput.lastEvaluatedKey;
        } while (result.length < limit && lastEvaluatedKey !== undefined);

        return {
            items: result,
            lastEvaluatedKey
        };
    };

    private createEmptyConnection = <T extends DynamoDbItem>(): Connection<T> => {
        return {
            edges: [],
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
            }
        };
    };

    private createConnection = <T extends DynamoDbItem>(
        hasNextPage: boolean,
        items: T[],
        lastEvaluatedKeySupplier: LastEvaluatedKeySupplier<T>
    ): Connection<T> => {
        return {
            edges: items.map((item) => ({
                node: item,
                cursor: this.base64Encoder.encode<QueryPrimaryKey>(lastEvaluatedKeySupplier(item))
            })),
            pageInfo: {
                hasNextPage,
                hasPreviousPage: false,
                startCursor: this.base64Encoder.encode<QueryPrimaryKey>(lastEvaluatedKeySupplier(items[0])),
                endCursor: this.base64Encoder.encode<QueryPrimaryKey>(lastEvaluatedKeySupplier(items[items.length - 1]))
            }
        };
    };

    private hasNextPage = <T>(limit: number, result: T[], lastEvaluatedKey?: QueryPrimaryKey) => {
        return limit < result.length || lastEvaluatedKey !== undefined;
    };
}
