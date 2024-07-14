import { Attribute, ItemSchema } from './Attribute';

export type BasePrimaryKey = Pick<ItemSchema, Attribute.PK | Attribute.SK>;
