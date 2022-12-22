import * as cdk from 'aws-cdk-lib';

export abstract class BaseResource {
    abstract readonly SERVICE_NAME: string;
    constructor() {}

    protected createNameTagProps(originName: string): cdk.CfnTag {
        return { key: 'Name', value: this.createResourceName(originName) };
    }

    protected createResourceName(originName: string): string {
        return `${originName}-${this.SERVICE_NAME}`;
    }
}
