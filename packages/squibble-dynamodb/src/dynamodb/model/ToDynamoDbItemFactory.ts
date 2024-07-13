import { DynamoDbItem } from './DynamoDbItem';

export interface ToDynamoDbItemFactory<CreateInput, EntityDynamoDbItem extends DynamoDbItem> {
    toDynamoDbItem(input: CreateInput): EntityDynamoDbItem;
}
