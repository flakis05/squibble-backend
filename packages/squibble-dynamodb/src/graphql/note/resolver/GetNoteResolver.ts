import { Resolver } from '../../../apollo/Resolver';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { NoteEntity, GetNoteInput, GetNoteOutput } from '../api/model';

export class GetNoteResolver implements Resolver<NoteEntity> {
    private handler: ApiCallHandler<GetNoteInput, GetNoteOutput>;

    constructor(handler: ApiCallHandler<GetNoteInput, GetNoteOutput>) {
        this.handler = handler;
    }

    public resolve = async (_: any, args: any): Promise<NoteEntity> => {
        const input: GetNoteInput = {
            noteId: args.noteId 
        };
        const output: GetNoteOutput = await this.handler.handle(input);
        return output.note;
    };
}