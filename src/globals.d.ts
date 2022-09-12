declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ACTIONS_ID_TOKEN_REQUEST_TOKEN: string;
            RUNNER_TEMP: string;
            GITHUB_REPOSITORY_OWNER: string;
        }
    }
}

export {};
