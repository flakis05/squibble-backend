import { CreateLabelInput, CreateLabelOutput } from '../../graphql/api/label/model';
import { CreateNoteInput, CreateNoteOutput } from '../../graphql/api/note/model';
import { ApiCallHandler } from '../../graphql/handler/ApiCallHandler';
import data from '../../resources/data/local-initial-data.json';

export const initializeItemsInTable = (
    createNoteHandler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>,
    createLabelHandler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>
) => {
    console.log('Initializing DynamoDb items');
    data.notes.forEach((item) => createNoteHandler.handle(item as CreateNoteInput));
    data.labels.forEach((item) => createLabelHandler.handle(item as CreateLabelInput));
    console.log('Initialized DynamoDb Items');
};
