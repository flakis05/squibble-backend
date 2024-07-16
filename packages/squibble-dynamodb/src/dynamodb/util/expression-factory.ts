import { DynamoDbItem } from '../model/DynamoDbItem';

export interface UpdateExpression {
    UpdateExpression: string;
    ExpressionAttributeNames: Record<string, string>;
    ExpressionAttributeValues: Record<string, any>;
}

const termKey = (label: string) => `#${label}`;
const termValue = (label: string) => `:${label}`;
const defaultLabel = 'attr';

const term = (label: string) => `${termKey(label)} = ${termValue(label)}`;

export const createUpdateExpression = <T extends DynamoDbItem>(data: T): UpdateExpression => {
    const keys: Record<string, string> = {};
    const values: Record<string, any> = {};
    const terms: string[] = [];
    let labelSuffix = 1;
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            const label = defaultLabel + labelSuffix;
            keys[termKey(label)] = key;
            values[termValue(label)] = value;
            terms.push(term(label));
            labelSuffix++;
        }
    });
    return {
        UpdateExpression: `SET ${terms.join(',')}`,
        ExpressionAttributeNames: keys,
        ExpressionAttributeValues: values
    };
};
