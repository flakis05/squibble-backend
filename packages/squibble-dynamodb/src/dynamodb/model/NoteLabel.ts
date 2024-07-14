import { Attribute, ItemSchema } from './Attribute';
import { BasePrimaryKey } from './Key';

type NoteLabelTableKeys = BasePrimaryKey;
type NoteLabelRequiredItemKeys = Pick<ItemSchema, Attribute.NOTE_ID | Attribute.LABEL_ID | Attribute.CREATED_AT>;

export type NoteLabelDynamoDbItem = NoteLabelTableKeys & NoteLabelRequiredItemKeys;
