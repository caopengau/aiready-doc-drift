import { SQSEvent } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { randomUUID } from 'crypto';
import { getRemediation, updateRemediation } from '../lib/db/remediation';
import { getRepository } from '../lib/db/repositories';
import { getUser } from '../lib/db/users';
import { sendRemediationNotificationEmail } from '../lib/email';

// Force bundling of agents for dynamic loading
import '../../../packages/agents';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://platform.getaiready.dev';

export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const {
      remediationId,
      repoId,
      userId: _userId,
      accessToken,
    } = JSON.parse(record.body) as {
      remediationId: string;
      repoId: string;
      userId: string;
      accessToken?: string;
    };

    const userId = _userId;

    console.log(
      `[RemediationWorker] Processing remediation ${remediationId} for repo ${repoId}`
    );

    const [remediation, repo, user] = await Promise.all([
      getRemediation(remediationId),
      getRepository(repoId),
      getUser(userId),
    ]);

    if (!remediation || !repo) {
      console.error(`[RemediationWorker] Remediation or Repo not found`);
      continue;
    }

    const tempDir = path.join('/tmp', `remedy-${randomUUID()}`);

    try {
      await updateRemediation(remediationId, {
        status: 'in-progress',
        agentStatus: 'Initializing workspace and cloning repository...',
      });

      console.log(`[RemediationWorker] Cloning ${repo.url} to ${tempDir}...`);

      await git.clone({
        fs,
        http,
        dir: tempDir,
        url: repo.url,
        singleBranch: true,
        depth: 1,
        onAuth: () => ({ username: accessToken || '', password: '' }),
      });

      // Import Mastra Agents and Workflows
      // We use dynamic imports to keep the initial load light
      const { RemediationSwarm } = await import('@aiready/agents');

      await updateRemediation(remediationId, {
        agentStatus:
          'Remediation Swarm active: Researching issue and planning fix...',
      });

      // Execute the Mastra Workflow
      // Note: This is where the real LLM magic happens
      const result = await RemediationSwarm.execute({
        remediation,
        repo,
        rootDir: tempDir,
        // Pass necessary credentials/config for the agents
        config: {
          githubToken: accessToken,
          openaiApiKey: process.env.OPENAI_API_KEY,
          anthropicApiKey: process.env.MINIMAX_API_KEY,
          anthropicBaseUrl: 'https://api.minimax.io/anthropic',
          model: process.env.MINIMAX_MODEL || 'MiniMax-M2.7',
        },
      });

      console.log(
        `[RemediationWorker] Workflow execution completed for ${remediationId}`
      );

      // The workflow itself should have updated the remediation status
      // via its own tool calls, but we do a final check/update here.
      if (result.ok && result.value) {
        const { prUrl, prNumber, diff, status, reasoning } =
          result.value as any;

        if (status === 'failure') {
          throw new Error(
            result.value.explanation || 'Agent failed to refactor'
          );
        }

        await updateRemediation(remediationId, {
          status: 'reviewing',
          agentStatus: 'Remediation complete. PR created for Expert Review.',
          suggestedDiff: diff || 'Diff not provided',
          reasoning: reasoning || 'Reasoning not provided',
          prUrl: prUrl,
          prNumber: prNumber,
        });

        if (user?.email) {
          await sendRemediationNotificationEmail({
            to: user.email,
            repoName: repo.name,
            remediationTitle: remediation.title,
            status: 'reviewing',
            prUrl: prUrl,
            prNumber: prNumber,
            dashboardUrl: `${APP_URL}/dashboard/repo/${repo.id}`,
          });
        }
      } else {
        throw new Error(result.error || 'Workflow execution failed');
      }
    } catch (error) {
      console.error(
        `[RemediationWorker] Error processing remediation ${remediationId}:`,
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error during remediation';
      await updateRemediation(remediationId, {
        status: 'failed',
        agentStatus: `Error: ${errorMessage}`,
      });

      if (user?.email) {
        await sendRemediationNotificationEmail({
          to: user.email,
          repoName: repo.name,
          remediationTitle: remediation.title,
          status: 'failed',
          error: errorMessage,
          dashboardUrl: `${APP_URL}/dashboard/repo/${repo.id}`,
        });
      }
    } finally {
      // Cleanup temp directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error(`[RemediationWorker] Cleanup error:`, cleanupError);
      }
    }
  }
}
