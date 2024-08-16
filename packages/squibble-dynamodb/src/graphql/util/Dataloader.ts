import { Errorable } from '../../api/model';

export interface DataLoader<K, V> {
    load(keys: K[]): Promise<Errorable<V>[]>;
}
