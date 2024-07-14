import { CreateNoteInput, CreateNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class CreateNoteMutationCall implements MutationCall<CreateNoteInput, CreateNoteOutput> {
    private handler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>;

    constructor(handler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: CreateNoteInput): Promise<CreateNoteOutput> => {
        return this.handler.handle(input);
    };
}
