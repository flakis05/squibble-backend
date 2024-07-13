import { DynamoDbItem } from './DynamoDbItem';

export interface FromDynamoDbItemFactory<EntityDynamoDbItem extends DynamoDbItem, Entity> {
    fromDynamoDbItem(item: EntityDynamoDbItem): Entity;
}
