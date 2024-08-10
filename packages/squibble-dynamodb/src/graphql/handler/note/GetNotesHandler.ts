import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { Edge, QueryRequestInput, SortDirection } from '../../api/shared/model';
import { ApiCallHandler } from '../ApiCallHandler';
import { QueryHandler } from '../shared/QueryHandler';

import {
    AdvancedDynamoDbClientWrapper,
    QueryPrimaryKey
} from '../../../dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { NoteDynamoDbItem } from '../../../dynamodb/model/Note';
import { GetNotesInput, GetNotesOutput, NoteEntity, SortNotesBy } from '../../api/note/model';
import { Index, Table } from '../../../dynamodb/model/Table';
import { createQueryExpressionWithSortKeyBeginsWith } from '../../../dynamodb/util/expression-factory';
import { noteGsi1PartitionKey, noteGsi2PartitionKey } from '../../../dynamodb/key/note-key-factory';
import { fromDynamoDbItem as fromDynamoDbItemToNoteEntity } from '../../api/note/factory/note-factory';
import { fromDynamoDbItem as fromDynamoDbItemToLabelEntity } from '../../api/label/factory/label-factory';
import { createKey } from '../../../dynamodb/key/key-factory';
import { RuntimeException } from '../../exception/RuntimeException';
import { LabelEntity } from '../../api/label/model';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { Attribute } from '../../../dynamodb/model/Attribute';
import { LabelDynamoDbItem, LabelsAttributeValue } from '../../../dynamodb/model/Label';
import { BatchInput, BatchGetItem, BatchInputBuilder } from '../../../dynamodb/wrapper/model/BatchInput';
import { BatchGetOutput } from '../../../dynamodb/wrapper/model/BatchGetOutput';
import { Nullable } from '../../../api/model';

export class GetNotesHandler implements ApiCallHandler<GetNotesInput, GetNotesOutput> {
    private advancedClient: AdvancedDynamoDbClientWrapper;
    private queryHandler: QueryHandler;

    constructor(advancedClient: AdvancedDynamoDbClientWrapper, queryHandler: QueryHandler) {
        this.advancedClient = advancedClient;
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
        const edges = await this.resolveEntities(result.edges);
        return {
            pageInfo: result.pageInfo,
            edges
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

    private resolveEntities = async (edges: Edge<NoteDynamoDbItem>[]): Promise<Edge<NoteEntity>[]> => {
        const items = edges.map((edge) => edge.node);
        const batchGetOutput = await this.getLabelDynamoDbItems(items);

        return edges.map((edge) => {
            const entity = fromDynamoDbItemToNoteEntity(edge.node);
            this.resolveLabels(edge.node, entity, batchGetOutput);
            return {
                cursor: edge.cursor,
                node: entity
            };
        });
    };

    private resolveLabels = (item: NoteDynamoDbItem, entity: NoteEntity, batchGetOutput: Nullable<BatchGetOutput>) => {
        if (batchGetOutput !== null && Object.keys(item[Attribute.LABELS]).length !== 0) {
            entity.labels = this.createNoteLabelEntities(item[Attribute.LABELS], batchGetOutput);
        } else {
            entity.labels = [];
        }
    };

    private getLabelDynamoDbItems = async (items: NoteDynamoDbItem[]): Promise<Nullable<BatchGetOutput>> => {
        const batchGetItems = this.createBatchInput(items);
        if (batchGetItems.items.length === 0) {
            return Promise.resolve(null);
        }
        return await this.advancedClient.batchGet(batchGetItems);
    };

    private createNoteLabelEntities = (
        labelOverrides: LabelsAttributeValue,
        batchGetOutput: BatchGetOutput
    ): LabelEntity[] => {
        return Object.values(labelOverrides).map((labelOverride) => {
            const label = batchGetOutput.getItem(
                Table.BASE,
                createLabelBasePrimaryKey(labelOverride.labelId)
            ) as LabelDynamoDbItem;
            return fromDynamoDbItemToLabelEntity(label, labelOverride);
        });
    };

    private createBatchInput = (items: NoteDynamoDbItem[]): BatchInput<BatchGetItem> => {
        const batchGetItems = items.reduce<BatchGetItem[]>((accumulator, item) => {
            if (Object.keys(item[Attribute.LABELS]).length !== 0) {
                accumulator.push(...this.createBatchGetItems(item[Attribute.LABELS]));
            }
            return accumulator;
        }, []);
        return new BatchInputBuilder<BatchGetItem>().addItems(batchGetItems).build();
    };

    private createBatchGetItems = (overrideLabels: LabelsAttributeValue): BatchGetItem[] => {
        return Object.values(overrideLabels).map((label) => ({
            table: Table.BASE,
            attributes: createLabelBasePrimaryKey(label.labelId)
        }));
    };
}
