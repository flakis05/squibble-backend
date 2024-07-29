import { UnArchiveNoteInput, UnArchiveNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class UnArchiveNoteMutationCall implements MutationCall<UnArchiveNoteInput, UnArchiveNoteOutput> {
    private handler: ApiCallHandler<UnArchiveNoteInput, UnArchiveNoteOutput>;

    constructor(handler: ApiCallHandler<UnArchiveNoteInput, UnArchiveNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: UnArchiveNoteInput): Promise<UnArchiveNoteOutput> => {
        return this.handler.handle(input);
    };
}
