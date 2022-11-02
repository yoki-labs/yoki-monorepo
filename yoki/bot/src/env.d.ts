// add env variables typing to process.env
declare namespace NodeJS {
    export interface ProcessEnv {
        GUILDED_TOKEN: string;
        DEFAULT_PREFIX: string;
        ERROR_WEBHOOK: string;
        MAIN_SERVER: string;
        S3_KEY_ID: string;
        S3_SECRET_KEY: string;
        S3_BUCKET: string;
    }
}
