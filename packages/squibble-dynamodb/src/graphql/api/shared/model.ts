import { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { QueryPrimaryKey } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

export enum SortDirection {
    ASCENDING = 'ascending',
    DESCENDING = 'descending'
}

export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
}
export interface Edge<T> {
    node: T;
    cursor: string;
}
export interface Connection<T> {
    edges: Edge<T>[];
    pageInfo: PageInfo;
}

export type QueryInputSupplier = (exclusiveStartKey?: QueryPrimaryKey) => QueryCommandInput;
export type LastEvaluatedKeySupplier<T extends DynamoDbItem> = (item: T) => QueryPrimaryKey;
export interface QueryRequestInput<T extends DynamoDbItem, E> {
    limit: number;
    after?: string;
    queryInputSupplier: QueryInputSupplier;
    fromDynamoDbItem: (item: T) => E;
    lastEvaluatedKeySupplier: LastEvaluatedKeySupplier<T>;
}
export type QueryRequestOutput<T> = Connection<T>;
