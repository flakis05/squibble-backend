import { Attribute } from "./Attribute";

export interface SquibbleItem {
    [Attribute.PK]: string;
    [Attribute.SK]: string;
    [Attribute.CREATED_AT]: string;
    [Attribute.MODIFIED_AT]: string;
    [Attribute.NOTE_ID]: string;
    [Attribute.TITLE]: string;
    [Attribute.CONTENT]: string;
}