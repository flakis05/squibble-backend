import { Attribute } from '../../model/Attribute';
import { BasePrimaryKey } from '../../model/Key';

export const createBatchItemId = (key: BasePrimaryKey): string =>
    `${Attribute.PK}#${key[Attribute.PK]}#${Attribute.SK}#${key[Attribute.SK]}`;
