import { Attribute } from './Attribute';
import { BaseKeys} from './Key';
import { SquibbleItem } from './SquibbleItem';

type NoteTableKeys = BaseKeys
type NoteRequiredItemKeys = Pick<
    SquibbleItem,
    | Attribute.NOTE_ID
    | Attribute.CREATED_AT
    | Attribute.MODIFIED_AT
    | Attribute.CONTENT
    >
type NoteOptionalItemKeys = Partial<Pick<SquibbleItem, Attribute.TITLE>>

export type NoteDynamoDbItem = NoteTableKeys & NoteRequiredItemKeys & NoteOptionalItemKeys;



