import { ID } from '../../api/model';
import { Key } from '../wrapper/DynamoDbClientWrapper';

export interface GenericKey extends Key {
    pk: ID;
    sk?: ID;
}
