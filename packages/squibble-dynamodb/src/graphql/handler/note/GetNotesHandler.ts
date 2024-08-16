import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { QueryRequestInput, SortDirection } from '../../api/shared/model';
import { ApiCallHandler } from '../ApiCallHandler';
import { QueryHandler } from '../shared/QueryHandler';

import { QueryPrimaryKey } from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { GetNotesInput, GetNotesOutput, SortNotesBy } from '../../api/note/model';
import { Index, Table } from '../../../dynamodb/model/Table';
import { createQueryExpressionWithSortKeyBeginsWith } from '../../../dynamodb/util/expression-factory';
import { noteGsi1PartitionKey, noteGsi2PartitionKey } from '../../../dynamodb/key/note-key-factory';
import { fromDynamoDbItem as fromDynamoDbItemToNoteEntity } from '../../api/note/factory/note-factory';
import { createKey } from '../../../dynamodb/key/key-factory';
import { RuntimeException } from '../../exception/RuntimeException';

export class GetNotesHandler implements ApiCallHandler<GetNotesInput, GetNotesOutput> {
    private queryHandler: QueryHandler;

    constructor(queryHandler: QueryHandler) {
        this.queryHandler = queryHandler;
    }

    public handle = async (input: GetNotesInput): Promise<GetNotesOutput> => {
        const queryInputSupplier = (exclusiveStartKey?: QueryPrimaryKey) => {
            switch (input.sort.by) {
                case SortNotesBy.MODIFIED_DATE:
                    return this.sortByModifiedDateQueryInputSupplier(input.sort.direction, exclusiveStartKey);
                case SortNotesBy.CREATED_DATE:
                    return this.sortByCreatedDateQueryInputSupplier(input.sort.direction, exclusiveStartKey);
                default:
                    throw new RuntimeException('Unsupported SortNotesBy: ' + input.sort.by);
            }
        };
        const lastEvaluatedKeySupplier = (item: NoteDynamoDbItem): QueryPrimaryKey => {
            switch (input.sort.by) {
                case SortNotesBy.MODIFIED_DATE:
                    return { gsi1Pk: item.gsi1Pk, gsi1Sk: item.gsi1Sk };
                case SortNotesBy.CREATED_DATE:
                    return { gsi2Pk: item.gsi2Pk, gsi2Sk: item.gsi2Sk };
                default:
                    throw new RuntimeException('Unsupported SortNotesBy: ' + input.sort.by);
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

    private sortByModifiedDateQueryInputSupplier = (
        sortDirection: SortDirection,
        exclusiveStartKey?: QueryPrimaryKey
    ): QueryCommandInput => ({
        TableName: Table.BASE,
        IndexName: Index.ONE,
        ...createQueryExpressionWithSortKeyBeginsWith({
            gsi1Pk: noteGsi1PartitionKey(),
            gsi1Sk: createKey('user', '<user_id>', 'note')
        }),
        ScanIndexForward: sortDirection === SortDirection.ASCENDING,
        ExclusiveStartKey: exclusiveStartKey
    });

    private sortByCreatedDateQueryInputSupplier = (
        sortDirection: SortDirection,
        exclusiveStartKey?: QueryPrimaryKey
    ): QueryCommandInput => ({
        TableName: Table.BASE,
        IndexName: Index.TWO,
        ...createQueryExpressionWithSortKeyBeginsWith({
            gsi2Pk: noteGsi2PartitionKey(),
            gsi2Sk: createKey('user', '<user_id>', 'note')
        }),
        ScanIndexForward: sortDirection === SortDirection.ASCENDING,
        ExclusiveStartKey: exclusiveStartKey
    });
}
