import { ID } from "../../api/model";
import { GenericKey } from "./GenericKey";
import { createKey } from "./key-factory";

export const buildBaseGenericKey = (noteId: ID): GenericKey => ({
    pk: createKey('user', '<user_id>', 'notes'),
    sk: createKey('user', '<user_id>', 'note', noteId),
})