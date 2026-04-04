/**
 * AWS Account Vending and Bootstrapping for ClawMore Managed nodes.
 *
 * This module has been split into:
 * - account-management.ts: Core account creation and pool management.
 * - oidc-bootstrap.ts: OIDC trust and IAM role setup.
 * - autonomous-deploy.ts: CodeBuild integration for autonomous deployments.
 */

export * from './account-management';
export * from './oidc-bootstrap';
export * from './autonomous-deploy';
