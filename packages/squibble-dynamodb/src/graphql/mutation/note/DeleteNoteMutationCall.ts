import { DeleteNoteInput, DeleteNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class DeleteNoteMutationCall implements MutationCall<DeleteNoteInput, DeleteNoteOutput> {
    private handler: ApiCallHandler<DeleteNoteInput, DeleteNoteOutput>;

    constructor(handler: ApiCallHandler<DeleteNoteInput, DeleteNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: DeleteNoteInput): Promise<DeleteNoteOutput> => {
        return this.handler.handle(input);
    };
}
