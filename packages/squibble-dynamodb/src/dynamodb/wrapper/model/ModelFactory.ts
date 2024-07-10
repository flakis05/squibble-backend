import { DynamoDbItem } from './DynamoDbItem';

export interface ModelFactory<Input extends DynamoDbItem, Output> {
    fromDynamoDbItem(item: Input): Output;
}