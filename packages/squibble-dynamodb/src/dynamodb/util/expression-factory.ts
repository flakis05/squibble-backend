import { DynamoDbItem } from '../model/DynamoDbItem';

export interface UpdateExpression {
    UpdateExpression: string;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: Record<string, any>;
}

const termKey = (label: string) => `#${label}`;
const termValue = (label: string) => `:${label}`;
const defaultLabel = 'attr';
const defaultMapEntryLabel = 'mapEntry';

const term = (label: string) => `${termKey(label)} = ${termValue(label)}`;
const mapTerm = (label: string, mapEntryLabel: string) =>
    `${termKey(label)}.${termKey(mapEntryLabel)} = ${termValue(mapEntryLabel)}`;

export const createUpdateExpression = <T extends DynamoDbItem>(data: T): UpdateExpression => {
    const keys: Record<string, string> = {};
    const values: Record<string, any> = {};
    const terms: string[] = [];
    let labelSuffix = 1;
    let mapEntryLabelSuffix = 1;
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            const label = defaultLabel + labelSuffix;
            if (typeof value === 'object' && !Array.isArray(value)) {
                keys[termKey(label)] = key;
                Object.entries(value).forEach(([mapEntryKey, mapEntryValue]) => {
                    const mapEntryLabel = defaultMapEntryLabel + mapEntryLabelSuffix;
                    keys[termKey(mapEntryLabel)] = mapEntryKey;
                    values[termValue(mapEntryLabel)] = mapEntryValue;
                    terms.push(mapTerm(label, mapEntryLabel));
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
    return {
        UpdateExpression: `SET ${terms.join(', ')}`,
        ExpressionAttributeNames: keys,
        ExpressionAttributeValues: values
    };
};
