import { Never } from '../../api/model';
import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';

export type BasePrimaryKey = Required<Pick<DynamoDbItem, Attribute.PK | Attribute.SK>>;
export type GSI1PrimaryKey = Required<Pick<DynamoDbItem, Attribute.GSI1_PK | Attribute.GSI1_SK>>;
export type GSI2PrimaryKey = Required<Pick<DynamoDbItem, Attribute.GSI2_PK | Attribute.GSI2_SK>>;
export type OptionalGSI1PrimaryKey = GSI1PrimaryKey | Never<Pick<DynamoDbItem, Attribute.GSI1_PK | Attribute.GSI1_SK>>;
export type OptionalGSI2PrimaryKey = GSI2PrimaryKey | Never<Pick<DynamoDbItem, Attribute.GSI2_PK | Attribute.GSI2_SK>>;
