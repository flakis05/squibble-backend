import { Attribute, ItemSchema } from './Attribute';

export type BaseKeys = Pick<ItemSchema, Attribute.PK | Attribute.SK>;
