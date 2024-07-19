import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';

export type BasePrimaryKey = Required<Pick<DynamoDbItem, Attribute.PK | Attribute.SK>>;
