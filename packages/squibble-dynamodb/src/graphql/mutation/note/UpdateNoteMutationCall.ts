import { UpdateNoteInput, UpdateNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class UpdateNoteMutationCall implements MutationCall<UpdateNoteInput, UpdateNoteOutput> {
    private handler: ApiCallHandler<UpdateNoteInput, UpdateNoteOutput>;

    constructor(handler: ApiCallHandler<UpdateNoteInput, UpdateNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: UpdateNoteInput): Promise<UpdateNoteOutput> => {
        return this.handler.handle(input);
    };
}
