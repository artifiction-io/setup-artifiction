import * as core from '@actions/core';
import fetch from 'node-fetch';

const apiHost = 'pkgs.artifiction.io';

async function run() {
    try {
        await doWork();
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error);
        } else {
            core.setFailed(error.toString());
        }
    }
}

async function doWork() {
    if (!(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN && process.env.RUNNER_TEMP)) {
        throw new Error('Are we running in GitHub Actions?');
    }

    const github_token = await core.getIDToken('artifiction.io');
    core.setSecret(github_token);

    // Exchange GitHub OIDC token for Artifiction token
    const response = await fetch(`https://${apiHost}/token`, {
        method: 'POST',
        headers: { authorization: `Bearer ${github_token}` },
    });
    if (!response.ok) {
        throw new Error(`Failed to exchange Artifiction token (${response.status}) ${await response.text()}`);
    }
    const { token } = (await response.json()) as { token: string };
    core.setSecret(token);
    const encodedToken = encodeURIComponent(token);
    core.setSecret(encodedToken);

    const tools = core.getMultilineInput('tools').flatMap(tool => tool.split('\\s+'));
    console.log('Configuring Artifiction for', tools.join(', '));

    // Configure pip
    core.exportVariable(
        'PIP_INDEX_URL',
        `https://token:${encodedToken}@${apiHost}/r/gh/${process.env.GITHUB_REPOSITORY_OWNER}/contents/pypi/simple/`,
    );

    // Configure poetry config
    core.exportVariable('POETRY_HTTP_BASIC_ARTIFICTION_USERNAME', 'token');
    core.exportVariable('POETRY_HTTP_BASIC_ARTIFICTION_PASSWORD', token);
}

run();
