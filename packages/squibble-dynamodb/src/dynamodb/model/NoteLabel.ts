import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';
import { BasePrimaryKey } from './Key';

type NoteLabelTableKeys = BasePrimaryKey;
type NoteLabelRequiredItemKeys = Required<
    Pick<DynamoDbItem, Attribute.NOTE_ID | Attribute.LABEL_ID | Attribute.CREATED_AT>
>;

export type NoteLabelDynamoDbItem = NoteLabelTableKeys & NoteLabelRequiredItemKeys;
