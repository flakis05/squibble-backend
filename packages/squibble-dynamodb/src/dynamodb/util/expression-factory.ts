import { Nullable, NullableRecordValues } from '../../api/model';
import { Attribute } from '../model/Attribute';
import { DynamoDbItem } from '../model/DynamoDbItem';

export interface UpdateExpression {
    UpdateExpression: string;
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

export const attributeExists = (attribute: Attribute) => `attribute_exists(${attribute})`;
