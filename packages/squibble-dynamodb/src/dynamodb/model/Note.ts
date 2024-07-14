import { Attribute, ItemSchema } from './Attribute';
import { BasePrimaryKey } from './Key';

type NoteTableKeys = BasePrimaryKey;
type NoteRequiredItemKeys = Pick<
    ItemSchema,
    Attribute.NOTE_ID | Attribute.CREATED_AT | Attribute.MODIFIED_AT | Attribute.CONTENT
>;
type NoteOptionalItemKeys = Partial<Pick<ItemSchema, Attribute.TITLE>>;

export type NoteDynamoDbItem = NoteTableKeys & NoteRequiredItemKeys & NoteOptionalItemKeys;
