import { AddedAt } from '../../api/model';
import { Attribute, ItemSchema } from './Attribute';
import { BasePrimaryKey } from './Key';

export type LabelsAttributeValue = Record<
    string,
    Pick<LabelDynamoDbItem, Attribute.LABEL_ID | Attribute.COLOR> & AddedAt
>;

type LabelTableKeys = BasePrimaryKey;
type LabelRequiredItemKeys = Pick<
    ItemSchema,
    Attribute.LABEL_ID | Attribute.CREATED_AT | Attribute.TITLE | Attribute.COLOR
>;
type LabelOptionalItemKeys = Partial<Pick<ItemSchema, Attribute.DELETED_AT>>;

export type LabelDynamoDbItem = LabelTableKeys & LabelRequiredItemKeys & LabelOptionalItemKeys;
