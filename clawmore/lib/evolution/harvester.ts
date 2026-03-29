import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { getUserMetadata, createInnovationPatternRecord } from '../db';

export const InnovationPatternSchema = z.object({
  title: z.string().describe('Short, descriptive title of the optimization'),
  rationale: z
    .string()
    .describe('Why this change improves the serverless architecture'),
  logic: z.string().describe('The abstracted code logic or pattern'),
  category: z.enum(['performance', 'security', 'cost', 'reliability']),
  filesAffected: z
    .array(z.string())
    .describe('List of generic file paths this pattern applies to'),
});

export type InnovationPattern = z.infer<typeof InnovationPatternSchema>;

export class Harvester {
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Scans a Spoke repository for recent mutations and extracts anonymous design improvements.
   * This uses the "Air-Gap" philosophy to ensure NO PII or client secrets are harvested.
   */
  public async harvestInnovation(
    owner: string,
    repo: string,
    userEmail: string
  ): Promise<InnovationPattern[]> {
    console.log(`[Harvester] Checking opt-in status for ${userEmail}...`);

    // 1. Check if user has opted into co-evolution
    const metadata = await getUserMetadata(userEmail);
    if (!metadata?.coEvolutionOptIn) {
      console.log(
        `[Harvester] Skipping ${owner}/${repo} - User has NOT opted into co-evolution.`
      );
      return [];
    }

    console.log(`[Harvester] Scanning ${owner}/${repo} for innovation DNA...`);

    // 2. Get recent commits within the core blueprint prefix
    const { data: commits } = await this.octokit.repos.listCommits({
      owner,
      repo,
      path: 'infrastructure/core',
      per_page: 5,
    });

    if (commits.length === 0) return [];

    // 3. Fetch commit diffs for AI analysis
    const diffs: string[] = [];
    for (const commit of commits.slice(0, 3)) {
      try {
        const { data: commitDetail } = await this.octokit.repos.getCommit({
          owner,
          repo,
          ref: commit.sha,
        });
        const patch = commitDetail.files
          ?.map((f) => `--- ${f.filename}\n${f.patch || ''}`)
          .join('\n\n');
        if (patch) diffs.push(patch);
      } catch {
        // Skip commits we can't read
      }
    }

    if (diffs.length === 0) return [];

    // 4. AI Extraction via OpenRouter
    const extractedPatterns = await this.extractPatternsViaAI(
      diffs.join('\n---\n')
    );

    // 5. Persistence for Curation
    for (const pattern of extractedPatterns) {
      await createInnovationPatternRecord({
        pattern,
        sourceRepo: repo,
        sourceOwner: owner,
      });
      console.log(`[Harvester] Recorded pending innovation: ${pattern.title}`);
    }

    return extractedPatterns;
  }

  private async extractPatternsViaAI(
    diffs: string
  ): Promise<InnovationPattern[]> {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      console.warn('[Harvester] No MINIMAX_API_KEY set, skipping AI extraction');
      return [];
    }

    try {
      const response = await fetch(
        'https://api.minimax.chat/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'MiniMax-2.7',
            messages: [
              {
                role: 'system',
                content: `You are a code pattern extractor. Analyze git diffs and extract reusable innovation patterns.
Return a JSON array of objects with this exact shape:
[{"title": "string", "rationale": "string", "logic": "string (abstracted code)", "category": "performance|security|cost|reliability", "filesAffected": ["string"]}]

Rules:
- Only extract genuinely reusable patterns, not one-off fixes
- Abstract the logic - no PII, no secrets, no client-specific code
- If no patterns found, return []
- Return ONLY the JSON array, no other text`,
              },
              {
                role: 'user',
                content: `Analyze these git diffs for reusable serverless architecture patterns:\n\n${diffs.slice(0, 8000)}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 1000,
          }),
        }
      );

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return [];

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed
        .filter(
          (p: any) =>
            p.title && p.rationale && p.logic && p.category && p.filesAffected
        )
        .slice(0, 3); // Max 3 patterns per harvest
    } catch (err) {
      console.error('[Harvester] AI extraction failed:', err);
      return [];
    }
  }
}
