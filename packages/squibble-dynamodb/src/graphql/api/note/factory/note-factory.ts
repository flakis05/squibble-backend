import { Attribute } from '../../../../dynamodb/model/Attribute';
import { NoteDynamoDbItem } from '../../../../dynamodb/model/Note';
import { NoteEntity } from '../model';

export const fromDynamoDbItem = (item: NoteDynamoDbItem): NoteEntity => {
    return {
        noteId: item[Attribute.NOTE_ID],
        createdAt: item[Attribute.CREATED_AT],
        modifiedAt: item[Attribute.MODIFIED_AT],
        deletedAt: item[Attribute.DELETED_AT],
        archivedAt: item[Attribute.ARCHIVED_AT],
        title: item[Attribute.TITLE],
        content: item[Attribute.CONTENT]
    };
};
