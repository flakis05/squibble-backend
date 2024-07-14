import { NativeAttributeValue } from '@aws-sdk/lib-dynamodb';
import { ID } from '../../api/model';

type Key = Record<string, NativeAttributeValue>;

export interface GenericKey extends Key {
    pk: ID;
    sk?: ID;
}
