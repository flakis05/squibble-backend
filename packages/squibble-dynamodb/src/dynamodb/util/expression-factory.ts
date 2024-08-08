import { Nullable, NullableRecordValues } from '../../api/model';
import { RuntimeException } from '../../graphql/exception/RuntimeException';
import { Attribute } from '../model/Attribute';
import { DynamoDbItem } from '../model/DynamoDbItem';
import { BasePrimaryKey, GSI1PrimaryKey, GSI2PrimaryKey } from '../model/Key';
import { QueryPrimaryKey } from '../wrapper/AdvancedDynamoDbClientWrapper';
import { beginsWith } from './condition-expression';
import { and } from './condition-expression';

export interface UpdateExpression {
    UpdateExpression: string;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: Record<string, any>;
}

export interface QueryExpression {
    KeyConditionExpression: string;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: Record<string, any>;
}

const termKey = (label: string) => `#${label}`;
const mapTermKey = (label: string, mapEntryLabel: string) => `${termKey(label)}.${termKey(mapEntryLabel)}`;
const termValue = (label: string) => `:${label}`;
const defaultLabel = 'attr';
const defaultMapEntryLabel = 'mapEntry';

const term = (label: string) => `${termKey(label)} = ${termValue(label)}`;
const mapTerm = (label: string, mapEntryLabel: string) =>
    `${mapTermKey(label, mapEntryLabel)} = ${termValue(mapEntryLabel)}`;

export const createUpdateExpression = <T extends DynamoDbItem>(
    data: Nullable<T> | NullableRecordValues<T>
): UpdateExpression => {
    const keys: Record<string, string> = {};
    const values: Record<string, any> = {};
    const terms: string[] = [];
    const deletedTerms: string[] = [];
    let labelSuffix = 1;
    let mapEntryLabelSuffix = 1;
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            const label = defaultLabel + labelSuffix;
            if (value === null) {
                keys[termKey(label)] = key;
                deletedTerms.push(termKey(label));
                labelSuffix++;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                keys[termKey(label)] = key;
                Object.entries(value).forEach(([mapEntryKey, mapEntryValue]) => {
                    const mapEntryLabel = defaultMapEntryLabel + mapEntryLabelSuffix;
                    keys[termKey(mapEntryLabel)] = mapEntryKey;
                    if (mapEntryValue === null) {
                        deletedTerms.push(mapTermKey(label, mapEntryLabel));
                    } else {
                        values[termValue(mapEntryLabel)] = mapEntryValue;
                        terms.push(mapTerm(label, mapEntryLabel));
                    }
                    mapEntryLabelSuffix++;
                });
            } else {
                keys[termKey(label)] = key;
                values[termValue(label)] = value;
                terms.push(term(label));
                labelSuffix++;
            }
        }
    });

    let updateExpression = `SET ${terms.join(', ')}`;
    if (deletedTerms.length !== 0) {
        updateExpression = `${updateExpression} REMOVE ${deletedTerms.join(', ')}`;
    }

    return {
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: keys,
        ExpressionAttributeValues: values
    };
};

export const createQueryExpressionWithSortKeyBeginsWith = (primaryKey: QueryPrimaryKey): QueryExpression => {
    const keys: Record<string, string> = {};
    const values: Record<string, any> = {};
    const partitionKeyLabel = defaultLabel + 1;
    const sortKeyLabel = defaultLabel + 2;
    const createKeyConditionExpression = () => {
        switch (true) {
            case isBasePrimaryKey(primaryKey):
                keys[termKey(partitionKeyLabel)] = getAttributeName<BasePrimaryKey>(Attribute.PK);
                keys[termKey(sortKeyLabel)] = getAttributeName<BasePrimaryKey>(Attribute.SK);
                values[termValue(partitionKeyLabel)] = primaryKey.pk;
                values[termValue(sortKeyLabel)] = primaryKey.sk;
                return and(term(partitionKeyLabel), beginsWith(termKey(sortKeyLabel), termValue(sortKeyLabel)));

            case isGsi1PrimaryKey(primaryKey):
                keys[termKey(partitionKeyLabel)] = getAttributeName<GSI1PrimaryKey>(Attribute.GSI1_PK);
                keys[termKey(sortKeyLabel)] = getAttributeName<GSI1PrimaryKey>(Attribute.GSI1_SK);
                values[termValue(partitionKeyLabel)] = primaryKey.gsi1Pk;
                values[termValue(sortKeyLabel)] = primaryKey.gsi1Sk;
                return and(term(partitionKeyLabel), beginsWith(termKey(sortKeyLabel), termValue(sortKeyLabel)));
            case isGsi2PrimaryKey(primaryKey):
                keys[termKey(partitionKeyLabel)] = getAttributeName<GSI2PrimaryKey>(Attribute.GSI2_PK);
                keys[termKey(sortKeyLabel)] = getAttributeName<GSI2PrimaryKey>(Attribute.GSI2_SK);
                values[termValue(partitionKeyLabel)] = primaryKey.gsi2Pk;
                values[termValue(sortKeyLabel)] = primaryKey.gsi2Sk;
                return and(term(partitionKeyLabel), beginsWith(termKey(sortKeyLabel), termValue(sortKeyLabel)));
            default:
                throw new RuntimeException('Unsupported QueryPrimaryKey: ' + primaryKey);
        }
    };
    return {
        KeyConditionExpression: createKeyConditionExpression(),
        ExpressionAttributeNames: keys,
        ExpressionAttributeValues: values
    };
};

const isBasePrimaryKey = (primaryKey: QueryPrimaryKey): primaryKey is BasePrimaryKey =>
    getAttributeName<BasePrimaryKey>(Attribute.PK) in primaryKey &&
    getAttributeName<BasePrimaryKey>(Attribute.SK) in primaryKey;
const isGsi1PrimaryKey = (primaryKey: QueryPrimaryKey): primaryKey is GSI1PrimaryKey =>
    getAttributeName<GSI1PrimaryKey>(Attribute.GSI1_PK) in primaryKey &&
    getAttributeName<GSI1PrimaryKey>(Attribute.GSI1_SK) in primaryKey;
const isGsi2PrimaryKey = (primaryKey: QueryPrimaryKey): primaryKey is GSI2PrimaryKey =>
    getAttributeName<GSI2PrimaryKey>(Attribute.GSI2_PK) in primaryKey &&
    getAttributeName<GSI2PrimaryKey>(Attribute.GSI2_SK) in primaryKey;

const getAttributeName = <T extends DynamoDbItem>(attribute: keyof T): keyof T => attribute as Attribute;
