import { Attribute } from './Attribute';
import { DynamoDbItem } from './DynamoDbItem';
import { BasePrimaryKey } from './Key';

type NoteTableKeys = BasePrimaryKey;
type NoteRequiredItemKeys = Required<
    Pick<
        DynamoDbItem,
        Attribute.NOTE_ID | Attribute.CREATED_AT | Attribute.MODIFIED_AT | Attribute.CONTENT | Attribute.LABELS
    >
>;
type NoteOptionalItemKeys = Partial<Pick<DynamoDbItem, Attribute.DELETED_AT | Attribute.TITLE>>;

export type NoteDynamoDbItem = NoteTableKeys & NoteRequiredItemKeys & NoteOptionalItemKeys;
