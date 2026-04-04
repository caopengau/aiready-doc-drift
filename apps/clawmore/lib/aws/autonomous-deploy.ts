import {
  CodeBuildClient,
  CreateProjectCommand,
  ImportSourceCredentialsCommand,
  StartBuildCommand,
} from '@aws-sdk/client-codebuild';
import { assumeSubAccountRole } from './oidc-bootstrap';

/**
 * Creates a CodeBuild project in the managed sub-account for autonomous deployments.
 */
export async function createCodeBuildProject(
  accountId: string,
  repoUrl: string,
  githubToken: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const codebuild = new CodeBuildClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials,
  });

  const projectName = 'ClawMore-Initial-Deploy';

  // 1. Import GitHub Credentials into the sub-account's CodeBuild
  try {
    await codebuild.send(
      new ImportSourceCredentialsCommand({
        authType: 'PERSONAL_ACCESS_TOKEN',
        serverType: 'GITHUB',
        token: githubToken,
      })
    );
  } catch (error: any) {
    if (
      error.name !== 'ResourceAlreadyExistsException' &&
      !error.message?.includes('AlreadyExists')
    ) {
      throw error;
    }
    console.log('[AWS] GitHub credentials already exist in sub-account.');
  }

  // 2. Create the CodeBuild Project
  try {
    await codebuild.send(
      new CreateProjectCommand({
        name: projectName,
        description: 'Autonomous deployment of the ClawMore Spoke node.',
        source: {
          type: 'GITHUB',
          location: repoUrl,
          buildspec: 'buildspec.yml',
        },
        artifacts: { type: 'NO_ARTIFACTS' },
        environment: {
          type: 'LINUX_CONTAINER',
          image: 'aws/codebuild/standard:7.0',
          computeType: 'BUILD_GENERAL1_SMALL',
          environmentVariables: [{ name: 'SST_STAGE', value: 'production' }],
        },
        serviceRole: `arn:aws:iam://${accountId}:role/ClawMore-Bootstrap-Role`,
      })
    );
  } catch (error: any) {
    if (
      error.name !== 'ResourceAlreadyExistsException' &&
      !error.message?.includes('AlreadyExists')
    ) {
      throw error;
    }
    console.log('[AWS] CodeBuild project already exists.');
  }

  return projectName;
}

/**
 * Starts a CodeBuild build in the managed sub-account.
 */
export async function triggerCodeBuildBuild(
  accountId: string,
  projectName: string
) {
  const credentials = await assumeSubAccountRole(accountId);
  const codebuild = new CodeBuildClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials,
  });

  await codebuild.send(
    new StartBuildCommand({
      projectName: projectName,
    })
  );
}
