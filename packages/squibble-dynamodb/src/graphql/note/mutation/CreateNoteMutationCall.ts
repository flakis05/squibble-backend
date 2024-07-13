import { MutationCall } from '../../MutationCall';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { CreateNoteInput, CreateNoteOutput } from '../api/model';

export class CreateNoteMutationCall implements MutationCall<CreateNoteInput, CreateNoteOutput> {
    private handler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>;

    constructor(handler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: CreateNoteInput): Promise<CreateNoteOutput> => {
        return this.handler.handle(input);
    };
}
