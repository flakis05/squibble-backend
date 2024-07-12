import { ModelFactory } from "../../../../dynamodb/wrapper/model/ModelFactory";
import { Attribute } from "../../../../dynamodb/model/Attribute";
import { NoteDynamoDbItem } from "../../../../dynamodb/model/Note";
import { NoteEntity } from "../model";

export class NoteFactory implements ModelFactory<NoteDynamoDbItem, NoteEntity> {
    public fromDynamoDbItem = (item: NoteDynamoDbItem): NoteEntity => {
       return {
            noteId: item[Attribute.NOTE_ID],
            createdAt: item[Attribute.CREATED_AT],
            modifiedAt: item[Attribute.MODIFIED_AT],
            title: item[Attribute.TITLE],
            content: item[Attribute.CONTENT],
        }
    }
}