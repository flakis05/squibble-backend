import { AddLabelToNoteInput, AddLabelToNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class AddLabelToNoteMutationCall implements MutationCall<AddLabelToNoteInput, AddLabelToNoteOutput> {
    private handler: ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput>;

    constructor(handler: ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: AddLabelToNoteInput): Promise<AddLabelToNoteOutput> => {
        return this.handler.handle(input);
    };
}
