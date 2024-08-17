import { Resolver } from '../../../apollo/Resolver';
import { GetNotesOutput, GetNotesInput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';

export class GetArchivesResolver implements Resolver<GetNotesOutput> {
    private handler: ApiCallHandler<GetNotesInput, GetNotesOutput>;

    constructor(handler: ApiCallHandler<GetNotesInput, GetNotesOutput>) {
        this.handler = handler;
    }

    public resolve = async (_: any, args: any): Promise<GetNotesOutput> => {
        const input: GetNotesInput = {
            noteId: args.noteId,
            limit: args.first,
            after: args.after,
            sort: args.sort,
            status: 'archived'
        };
        return await this.handler.handle(input);
    };
}
