import { Attribute } from '../../../../dynamodb/model/Attribute';
import { NoteDynamoDbItem } from '../../../../dynamodb/model/Note';
import { CreateNoteInput, NoteEntity } from '../model';
import { FromDynamoDbItemFactory } from '../../../../dynamodb/model/FromDynamoDbItemFactory';
import { WithDateNow } from '../../../../api/model';
import { ToDynamoDbItemFactory } from '../../../../dynamodb/model/ToDynamoDbItemFactory';
import { partitionKey, sortKey } from '../../../../dynamodb/key/note-key-factory';
import { KeySupplier } from '../../../util/KeySupplier';

export class NoteFactory
    implements
        FromDynamoDbItemFactory<NoteDynamoDbItem, NoteEntity>,
        ToDynamoDbItemFactory<WithDateNow<CreateNoteInput>, NoteDynamoDbItem>
{
    private keySupplier: KeySupplier;
    constructor(keySupplier: KeySupplier) {
        this.keySupplier = keySupplier;
    }

    public toDynamoDbItem(input: WithDateNow<CreateNoteInput>): NoteDynamoDbItem {
        const noteId = this.keySupplier.get();
        return {
            pk: partitionKey(),
            sk: sortKey(noteId),
            createdAt: input.dateNow,
            modifiedAt: input.dateNow,
            noteId: noteId,
            title: input.title,
            content: input.content
        };
    }
    public fromDynamoDbItem = (item: NoteDynamoDbItem): NoteEntity => {
        return {
            noteId: item[Attribute.NOTE_ID],
            createdAt: item[Attribute.CREATED_AT],
            modifiedAt: item[Attribute.MODIFIED_AT],
            title: item[Attribute.TITLE],
            content: item[Attribute.CONTENT]
        };
    };
}
