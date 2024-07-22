import { AddedAt } from '../../api/model';
import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';
import { BasePrimaryKey } from './Key';

type LabelsAttributeValueRequiredKeys = Required<Pick<DynamoDbItem, Attribute.LABEL_ID>>;
type LabelsAttributeValueOptionalKeys = Partial<Pick<DynamoDbItem, Attribute.COLOR>>;

export type LabelOverride = LabelsAttributeValueRequiredKeys & LabelsAttributeValueOptionalKeys & AddedAt;

export type LabelsAttributeValue = Record<string, LabelOverride>;

type LabelTableKeys = BasePrimaryKey;
type LabelRequiredItemKeys = Required<
    Pick<DynamoDbItem, Attribute.LABEL_ID | Attribute.CREATED_AT | Attribute.TITLE | Attribute.COLOR>
>;
type LabelOptionalItemKeys = Partial<Pick<DynamoDbItem, Attribute.DELETED_AT>>;

export type LabelDynamoDbItem = LabelTableKeys & LabelRequiredItemKeys & LabelOptionalItemKeys;
