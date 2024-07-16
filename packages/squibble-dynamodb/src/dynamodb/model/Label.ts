import { Attribute, ItemSchema } from './Attribute';
import { BasePrimaryKey } from './Key';

type LabelTableKeys = BasePrimaryKey;
type LabelRequiredItemKeys = Pick<
    ItemSchema,
    Attribute.LABEL_ID | Attribute.CREATED_AT | Attribute.TITLE | Attribute.COLOR
>;
type LabelOptionalItemKeys = Partial<Pick<ItemSchema, Attribute.DELETED_AT>>;

export type LabelDynamoDbItem = LabelTableKeys & LabelRequiredItemKeys & LabelOptionalItemKeys;
