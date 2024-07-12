export enum Attribute {
    PK = 'pk',
    SK = 'sk',
    CREATED_AT = 'createdAt',
    MODIFIED_AT = 'modifiedAt',
    NOTE_ID = 'noteId',
    TITLE = 'title',
    CONTENT = 'content'
}


export interface ItemSchema {
    [Attribute.PK]: string;
    [Attribute.SK]: string;
    [Attribute.CREATED_AT]: string;
    [Attribute.MODIFIED_AT]: string;
    [Attribute.NOTE_ID]: string;
    [Attribute.TITLE]: string;
    [Attribute.CONTENT]: string;
}