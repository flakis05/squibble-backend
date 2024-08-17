import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { QueryRequestInput, SortDirection } from '../../api/shared/model';
import { ApiCallHandler } from '../ApiCallHandler';
import { QueryHandler } from '../shared/QueryHandler';

import { QueryPrimaryKey } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { GetDeletedNotesInput, GetNotesOutput, SortDeletedNotesBy } from '../../api/note/model';
import { Index, Table } from '../../../dynamodb/model/Table';
import { createQueryExpressionWithSortKeyBeginsWith } from '../../../dynamodb/util/expression-factory';
import { deletedNoteGsi1PartitionKey } from '../../../dynamodb/key/note-key-factory';
import { fromDynamoDbItem as fromDynamoDbItemToNoteEntity } from '../../api/note/factory/note-factory';
import { createKey } from '../../../dynamodb/key/key-factory';
import { RuntimeException } from '../../exception/RuntimeException';

export class GetDeletedNotesHandler implements ApiCallHandler<GetDeletedNotesInput, GetNotesOutput> {
    private queryHandler: QueryHandler;

    constructor(queryHandler: QueryHandler) {
        this.queryHandler = queryHandler;
    }

    public handle = async (input: GetDeletedNotesInput): Promise<GetNotesOutput> => {
        const queryInputSupplier = (exclusiveStartKey?: QueryPrimaryKey) => {
            switch (input.sort.by) {
                case SortDeletedNotesBy.DELETED_DATE:
                    return this.sortByDeletedDateQueryInputSupplier(input.sort.direction, exclusiveStartKey);
                default:
                    throw new RuntimeException(`Unsupported SortDeletedNotesBy: ${input.sort.by}`);
            }
        };
        const lastEvaluatedKeySupplier = (item: NoteDynamoDbItem): QueryPrimaryKey => {
            switch (input.sort.by) {
                case SortDeletedNotesBy.DELETED_DATE:
                    return { gsi1Pk: item.gsi1Pk, gsi1Sk: item.gsi1Sk };
                default:
                    throw new RuntimeException(`Unsupported SortDeletedNotesBy: ${input.sort.by}`);
            }
        };
        const queryRequestInput: QueryRequestInput<NoteDynamoDbItem> = {
            limit: input.limit,
            after: input.after,
            queryInputSupplier,
            lastEvaluatedKeySupplier
        };
        const result = await this.queryHandler.handle(queryRequestInput);
        return {
            pageInfo: result.pageInfo,
            edges: result.edges.map((edge) => ({
                cursor: edge.cursor,
                node: fromDynamoDbItemToNoteEntity(edge.node)
            }))
        };
    };

    private sortByDeletedDateQueryInputSupplier = (
        sortDirection: SortDirection,
        exclusiveStartKey?: QueryPrimaryKey
    ): QueryCommandInput => ({
        TableName: Table.BASE,
        IndexName: Index.ONE,
        ...createQueryExpressionWithSortKeyBeginsWith({
            gsi1Pk: deletedNoteGsi1PartitionKey(),
            gsi1Sk: createKey('user', '<user_id>', 'note')
        }),
        ScanIndexForward: sortDirection === SortDirection.ASCENDING,
        ExclusiveStartKey: exclusiveStartKey
    });
}
