import {
  scanFiles,
  calculateDocDrift,
  getFileCommitTimestamps,
  getLineRangeLastModifiedCached,
  Severity,
  IssueType,
  emitProgress,
  getParser,
} from '@aiready/core';
import type { DocDriftOptions, DocDriftReport, DocDriftIssue } from './types';
import { readFileSync } from 'fs';

/**
 * Analyzes documentation drift across a set of files.
 * This tool detects:
 * 1. Missing documentation for complex functions/classes.
 * 2. Signature mismatches (parameters not mentioned in docs).
 * 3. Temporal drift (logic changed after documentation was last updated).
 *
 * @param options - Analysis configuration including include/exclude patterns and drift thresholds.
 * @returns A comprehensive report with drift scores and specific issues.
 */
export async function analyzeDocDrift(
  options: DocDriftOptions
): Promise<DocDriftReport> {
  // Use core scanFiles which respects .gitignore recursively
  const files = await scanFiles(options);
  const issues: DocDriftIssue[] = [];
  // const staleSeconds = staleMonths * 30 * 24 * 60 * 60; // Unused, removed

  let uncommentedExports = 0;
  let totalExports = 0;
  let outdatedComments = 0;
  let undocumentedComplexity = 0;
  let actualDrift = 0;

  // const now = Math.floor(Date.now() / 1000); // Unused, removed

  let processed = 0;
  for (const file of files) {
    processed++;
    emitProgress(
      processed,
      files.length,
      'doc-drift',
      'analyzing files',
      options.onProgress
    );

    const parser = await getParser(file);
    if (!parser) continue;

    let code: string;
    try {
      code = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }

    try {
      // Initialize parser (it's a singleton in core, but ensures WASM is loaded)
      await parser.initialize();
      const parseResult = parser.parse(code, file);

      let fileLineStamps: Record<number, number> | undefined;

      for (const exp of parseResult.exports) {
        // Only analyze functions and classes for documentation drift
        if (exp.type === 'function' || exp.type === 'class') {
          totalExports++;

          if (!exp.documentation) {
            uncommentedExports++;

            // Complexity check (heuristic based on line count if range available)
            if (exp.loc) {
              const lines = exp.loc.end.line - exp.loc.start.line;
              if (lines > 20) undocumentedComplexity++;
            }
          } else {
            const doc = exp.documentation;
            const docContent = doc.content;

            // Signature mismatch detection (generalized heuristic)
            // Only flag if documentation exists AND parameters are complex/important
            if (exp.type === 'function' && exp.parameters) {
              const params = exp.parameters;

              // Filter out self-explanatory parameter names that don't need documentation
              const descriptiveParams = new Set([
                'data',
                'item',
                'value',
                'key',
                'index',
                'id',
                'name',
                'type',
                'config',
                'options',
                'params',
                'args',
                'input',
                'output',
                'result',
                'response',
                'request',
                'callback',
                'handler',
                'event',
                'error',
                'message',
                'context',
                'file',
                'path',
                'url',
                'source',
                'target',
                'content',
                'body',
                'payload',
                'user',
                'userid',
                'user_id',
                'starttime',
                'endtime',
                'duration',
                'timeout',
                'retry',
                'count',
                'limit',
                'offset',
                'page',
                'size',
                'length',
                'width',
                'height',
                'depth',
                'color',
                'background',
                'foreground',
                'border',
                'margin',
                'padding',
                'position',
                'top',
                'bottom',
                'left',
                'right',
                'center',
                'start',
                'end',
                'begin',
                'finish',
                'complete',
                'pending',
                'active',
                'inactive',
                'enabled',
                'disabled',
                'visible',
                'hidden',
                'open',
                'closed',
                'locked',
                'unlocked',
                'read',
                'write',
                'append',
                'prepend',
                'insert',
                'replace',
                'merge',
                'split',
                'join',
                'filter',
                'map',
                'reduce',
                'find',
                'sort',
                'reverse',
                'unique',
                'flatten',
                'compact',
                'chunk',
                'zip',
                'unzip',
                'completed',
                'failed',
                'healthy',
                'high',
                'medium',
                'low',
                'running',
                'stopped',
                'title',
                'subtitle',
                'label',
                'description',
                'version',
                'timestamp',
                'date',
                'time',
                'status',
                'mode',
                'action',
                'effect',
                'resource',
                'principal',
                'statement',
                'sid',
                'allow',
                'deny',
                'roi',
                'unifiedbudget',
                'filepath',
                'rootdir',
                'fp',
                'email',
                'username',
                'password',
                'token',
                'secret',
                'apikey',
                'api_key',
                'baseurl',
                'base_url',
                'endpoint',
                'method',
                'headers',
                'queryparams',
                'query_params',
                'bodyparams',
                'body_params',
                'formdata',
                'form_data',
                'filename',
                'file_name',
                'filetype',
                'file_type',
                'filesize',
                'file_size',
                'filecontent',
                'file_content',
                'fileurl',
                'file_url',
                'fileid',
                'file_id',
                'filekey',
                'file_key',
                'filepath',
                'file_path',
                'filedir',
                'file_dir',
                'fileext',
                'file_ext',
                'filebase',
                'file_base',
                'filenamewithoutext',
                'file_name_without_ext',
                'filedirname',
                'file_dirname',
                'filebasename',
                'file_basename',
                'fileextname',
                'file_extname',
                'fileroot',
                'file_root',
                'filesep',
                'file_sep',
                'filejoin',
                'file_join',
                'fileresolve',
                'file_resolve',
                'filenormalize',
                'file_normalize',
                'filedirname',
                'file_dirname',
                'filebasename',
                'file_basename',
                'fileextname',
                'file_extname',
                'fileroot',
                'file_root',
                'filesep',
                'file_sep',
                'filejoin',
                'file_join',
                'fileresolve',
                'file_resolve',
                'filenormalize',
                'file_normalize',
              ]);

              // Check if parameters are mentioned in documentation
              const missingParams = params.filter((p) => {
                // Skip descriptive parameters that don't need documentation
                if (descriptiveParams.has(p.toLowerCase())) {
                  return false;
                }
                const regex = new RegExp(`\\b${p}\\b`);
                return !regex.test(docContent);
              });

              if (missingParams.length > 0) {
                outdatedComments++;
                issues.push({
                  type: IssueType.DocDrift,
                  severity: Severity.Major,
                  message: `Documentation mismatch: function parameters (${missingParams.join(', ')}) are not mentioned in the docs.`,
                  location: { file, line: exp.loc?.start.line || 1 },
                });
              }
            }

            // Timestamp comparison for temporal drift
            if (exp.loc && doc.loc) {
              if (!fileLineStamps) {
                fileLineStamps = getFileCommitTimestamps(file);
              }

              const bodyModified = getLineRangeLastModifiedCached(
                fileLineStamps,
                exp.loc.start.line,
                exp.loc.end.line
              );

              const docModified = getLineRangeLastModifiedCached(
                fileLineStamps,
                doc.loc.start.line,
                doc.loc.end.line
              );

              if (bodyModified > 0 && docModified > 0) {
                // If body was modified more than 1 day AFTER the documentation
                const DRIFT_THRESHOLD_SECONDS = 24 * 60 * 60;
                if (bodyModified - docModified > DRIFT_THRESHOLD_SECONDS) {
                  actualDrift++;
                  issues.push({
                    type: IssueType.DocDrift,
                    severity: Severity.Major,
                    message: `Documentation drift: logic was modified on ${new Date(bodyModified * 1000).toLocaleDateString()} but documentation was last updated on ${new Date(docModified * 1000).toLocaleDateString()}.`,
                    location: { file, line: doc.loc.start.line },
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Doc-drift: Failed to parse ${file}: ${error}`);
      continue;
    }
  }

  const riskResult = calculateDocDrift({
    uncommentedExports,
    totalExports,
    outdatedComments,
    undocumentedComplexity,
    actualDrift,
  });

  return {
    summary: {
      filesAnalyzed: files.length,
      functionsAnalyzed: totalExports,
      score: riskResult.score,
      rating: riskResult.rating,
    },
    issues,
    rawData: {
      uncommentedExports,
      totalExports,
      outdatedComments,
      undocumentedComplexity,
      actualDrift,
    },
    recommendations: riskResult.recommendations,
  };
}
