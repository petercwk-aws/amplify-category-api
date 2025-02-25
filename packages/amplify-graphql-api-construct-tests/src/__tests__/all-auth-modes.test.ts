import * as path from 'path';
import { createNewProjectDir, deleteProjectDir, initCDKProject, cdkDeploy, cdkDestroy } from 'amplify-category-api-e2e-core';
import { graphql } from '../graphql-request';

jest.setTimeout(1000 * 60 * 60 /* 1 hour */);

describe('CDK Auth Modes', () => {
  let projRoot: string;

  beforeEach(async () => {
    projRoot = await createNewProjectDir('allauthmodes');
  });

  afterEach(async () => {
    try {
      await cdkDestroy(projRoot, '--all');
    } catch (_) {
      /* No-op */
    }

    deleteProjectDir(projRoot);
  });

  test('CDK deploys with all auth modes enabled', async () => {
    const templatePath = path.resolve(path.join(__dirname, 'backends', 'all-auth-modes'));
    const name = await initCDKProject(projRoot, templatePath);
    const outputs = await cdkDeploy(projRoot, '--all');
    const { awsAppsyncApiEndpoint: apiEndpoint, awsAppsyncApiKey: apiKey } = outputs[name];

    // Shallow validation that api key works (e.g. stack deployed successfully)
    const createResult = await graphql(
      apiEndpoint,
      apiKey,
      /* GraphQL */ `
        mutation CREATE_TODO {
          createTodo(input: {}) {
            id
          }
        }
      `,
    );
    expect(createResult.statusCode).toEqual(200);
  });
});
