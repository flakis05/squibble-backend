export class Base64Encoder {
    public encode = <T>(value: T): string => {
        const data = JSON.stringify(value);
        return Buffer.from(data, 'ascii').toString('base64');
    };
    public decode = <T>(value: string): T => {
        const data = Buffer.from(value, 'base64').toString('ascii');
        return JSON.parse(data);
    };
}
