export enum Comparator {
    EQUAL = '=',
    NOT_EQUAL = '<>',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>='
}

export enum Type {
    STRING = 'S',
    STRING_SET = 'SS',
    NUMBER = 'N',
    NUMBER_SET = 'NS',
    BINARY = 'B',
    BINARY_SET = 'BS',
    BOOLEAN = 'BOOL',
    NULL = 'NULL',
    LIST = 'L',
    MAP = 'M'
}

export const comparator = (operandOne: string, operandTwo: string, comparator: Comparator) =>
    `${operandOne} ${comparator} ${operandTwo}`;
export const between = (operandOne: string, operandTwo: string, operandThree: string) =>
    `${operandOne} BETWEEN ${operandTwo} AND ${operandThree}`;
export const not = (condition: string) => `NOT ${condition}`;
export const term = (condition: string) => `(${condition})`;
export const attributeExists = (path: string) => `attribute_exists(${path})`;
export const attributeNotExists = (path: string) => `attribute_not_exists(${path})`;
export const attributeTYpe = (path: string, type: Type) => `attribute_type(${path}, ${type})`;
export const beginsWith = (path: string, substr: string) => `begins_with(${path}, ${substr})`;
export const contains = (path: string, operand: string) => `contains(${path}, ${operand})`;
export const size = (path: string) => `size(${path})`;
export const in_ = (operandOne: string, ...operands: string[]) => `${operandOne} IN (${operands.join(',')})`;
export const and = (conditionOne: string, conditionTwo: string) => `${conditionOne} AND ${conditionTwo}`;
export const or = (conditionOne: string, conditionTwo: string) => `${conditionOne} OR ${conditionTwo}`;
