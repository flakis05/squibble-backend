import { v4 as uuidv4 } from 'uuid';

import { Supplier } from './Supplier';

export class KeySupplier implements Supplier<string> {
    public get = () => {
        return uuidv4();
    };
}
