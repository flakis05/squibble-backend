import { Attribute } from './Attribute';
import { Color } from './Color';
import { BasePrimaryKey } from './Key';
import { LabelsAttributeValue } from './Label';

export interface DynamoDbItem {
    [Attribute.PK]?: string;
    [Attribute.SK]?: string;
    [Attribute.GSI1_PK]?: string;
    [Attribute.GSI1_SK]?: string;
    [Attribute.GSI2_PK]?: string;
    [Attribute.GSI2_SK]?: string;
    [Attribute.CREATED_AT]?: string;
    [Attribute.MODIFIED_AT]?: string;
    [Attribute.DELETED_AT]?: string;
    [Attribute.NOTE_ID]?: string;
    [Attribute.LABEL_ID]?: string;
    [Attribute.TITLE]?: string;
    [Attribute.CONTENT]?: string;
    [Attribute.COLOR]?: Color;
    [Attribute.LABELS]?: LabelsAttributeValue;
    [Attribute.DESCRIPTION]?: string;
}

export type UpdatedDynamoDbItem<T extends DynamoDbItem> = Partial<Omit<T, keyof BasePrimaryKey>>;
