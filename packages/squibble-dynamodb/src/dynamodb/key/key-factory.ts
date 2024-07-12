import { ID } from "../../api/model";

const KEY_SEPARATOR = '#';

export const createKey = (...labels: string[]): ID => KEY_SEPARATOR + labels.join(KEY_SEPARATOR);
