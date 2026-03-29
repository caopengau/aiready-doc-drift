import React from 'react';
import HqClient from './HqClient';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

export const metadata = {
  title: 'ClawHQ | Platform Orchestrator',
  description:
    'Global multi-tenant management for the ClawMore business empire.',
};

async function getPlatformStats() {
  const ddbClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(ddbClient);
  const TableName = process.env.DYNAMO_TABLE || '';

  try {
    // Count managed accounts
    const accountsRes = await docClient.send(
      new ScanCommand({
        TableName,
        FilterExpression: 'EntityType = :type',
        ExpressionAttributeValues: { ':type': 'ManagedAccount' },
        Select: 'COUNT',
      })
    );

    // Count mutations
    const mutationsRes = await docClient.send(
      new ScanCommand({
        TableName,
        FilterExpression: 'EntityType = :type',
        ExpressionAttributeValues: { ':type': 'MutationEvent' },
        Select: 'COUNT',
      })
    );

    // Sum AWS spend across accounts
    const accountsData = await docClient.send(
      new ScanCommand({
        TableName,
        FilterExpression: 'EntityType = :type',
        ExpressionAttributeValues: { ':type': 'ManagedAccount' },
      })
    );

    const totalSpendCents = (accountsData.Items || []).reduce(
      (sum: number, acc: any) => sum + (acc.currentMonthlySpendCents || 0),
      0
    );

    const totalOverageCents = (accountsData.Items || []).reduce(
      (sum: number, acc: any) => {
        const spend = acc.currentMonthlySpendCents || 0;
        return sum + Math.max(0, spend - 1500); // $15 inclusion
      },
      0
    );

    return {
      totalAccounts: accountsRes.Count || 0,
      activeMutations: mutationsRes.Count || 0,
      totalRevenueCents: totalSpendCents,
      computeOverageCents: totalOverageCents,
      systemHealth: 99.98,
    };
  } catch (err) {
    console.error('Failed to fetch platform stats:', err);
    return {
      totalAccounts: 0,
      activeMutations: 0,
      totalRevenueCents: 0,
      computeOverageCents: 0,
      systemHealth: 0,
    };
  }
}

export default async function HqPage() {
  const platformStats = await getPlatformStats();

  return <HqClient stats={platformStats} />;
}
