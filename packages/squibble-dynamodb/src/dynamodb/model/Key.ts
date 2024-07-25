import { Never } from '../../api/model';
import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';

export type BasePrimaryKey = Required<Pick<DynamoDbItem, Attribute.PK | Attribute.SK>>;
export type GSI1PrimaryKey = Required<Pick<DynamoDbItem, Attribute.GSI1_PK | Attribute.GSI1_SK>> | Never<Pick<DynamoDbItem, Attribute.GSI1_PK | Attribute.GSI1_SK>>;
export type GSI2PrimaryKey = Required<Pick<DynamoDbItem, Attribute.GSI2_PK | Attribute.GSI2_SK>> | Never<Pick<DynamoDbItem, Attribute.GSI2_PK | Attribute.GSI2_SK>>;
