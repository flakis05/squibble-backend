import { Attribute } from './Attribute';

export type DynamoDbItem = {
    [K in Attribute]?: any;
};
