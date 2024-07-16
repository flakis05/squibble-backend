import { Color } from './Color';
import { LabelsAttributeValue } from './Label';

export enum Attribute {
    PK = 'pk',
    SK = 'sk',
    CREATED_AT = 'createdAt',
    MODIFIED_AT = 'modifiedAt',
    DELETED_AT = 'deletedAt',
    NOTE_ID = 'noteId',
    LABEL_ID = 'labelId',
    TITLE = 'title',
    CONTENT = 'content',
    COLOR = 'color',
    LABELS = 'labels'
}

export interface ItemSchema {
    [Attribute.PK]: string;
    [Attribute.SK]: string;
    [Attribute.CREATED_AT]: string;
    [Attribute.MODIFIED_AT]: string;
    [Attribute.DELETED_AT]: string;
    [Attribute.NOTE_ID]: string;
    [Attribute.LABEL_ID]: string;
    [Attribute.TITLE]: string;
    [Attribute.CONTENT]: string;
    [Attribute.COLOR]: Color;
    [Attribute.LABELS]: LabelsAttributeValue;
}
