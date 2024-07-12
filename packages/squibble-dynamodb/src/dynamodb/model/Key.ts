import { Attribute } from "./Attribute";
import { SquibbleItem } from "./SquibbleItem";

export type BaseKeys = Pick<SquibbleItem, Attribute.PK | Attribute.SK>;