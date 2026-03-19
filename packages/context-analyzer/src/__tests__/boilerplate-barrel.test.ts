import { describe, it, expect } from 'vitest';
import {
  classifyFile,
  adjustFragmentationForClassification,
  adjustCohesionForClassification,
  getClassificationRecommendations,
} from '../index';
import type { DependencyNode } from '../types';

describe('boilerplate-barrel classification', () => {
  const createNode = (overrides: Partial<DependencyNode>): DependencyNode => ({
    file: 'test.ts',
    imports: [],
    exports: [],
    tokenCost: 100,
    linesOfCode: 50,
    ...overrides,
  });

  it('should classify single source pass-through as boilerplate-barrel', () => {
    const node = createNode({
      file: 'core/lib/types/domains/agent-types.ts',
      tokenCost: 50,
      exports: [{ name: '*', type: 'all', source: '../agent' } as any],
    });

    const classification = classifyFile(node, 1.0, ['agent']);
    expect(classification).toBe('boilerplate-barrel');
  });

  it('should classify meaningless aggregation (2 sources) as boilerplate-barrel', () => {
    const node = createNode({
      file: 'src/types/mini-barrel.ts',
      tokenCost: 80,
      exports: [
        { name: 'User', type: 'type', source: './user' } as any,
        { name: 'Profile', type: 'type', source: './profile' } as any,
      ],
    });

    const classification = classifyFile(node, 1.0, ['user', 'profile']);
    expect(classification).toBe('boilerplate-barrel');
  });

  it('should classify meaningful aggregation (5+ sources) as regular barrel-export', () => {
    const node = createNode({
      file: 'src/index.ts',
      tokenCost: 150,
      exports: [
        { name: 'A', type: 'const', source: './a' } as any,
        { name: 'B', type: 'const', source: './b' } as any,
        { name: 'C', type: 'const', source: './c' } as any,
        { name: 'D', type: 'const', source: './d' } as any,
        { name: 'E', type: 'const', source: './e' } as any,
      ],
    });

    const classification = classifyFile(node, 1.0, ['a', 'b', 'c', 'd', 'e']);
    expect(classification).toBe('barrel-export');
  });

  it('should NOT classify barrel with local logic as boilerplate', () => {
    const node = createNode({
      file: 'src/mixed-barrel.ts',
      tokenCost: 600, // Above limit
      exports: [
        { name: 'A', type: 'const', source: './a' } as any,
        { name: 'localFunc', type: 'function' } as any,
      ],
    });

    // Should default to something else, or if it matches barrel patterns but has local logic
    const classification = classifyFile(node, 0.5, ['a', 'local']);
    expect(classification).not.toBe('boilerplate-barrel');
  });

  it('should penalize boilerplate-barrel in cohesion adjustment', () => {
    const result = adjustCohesionForClassification(1.0, 'boilerplate-barrel');
    expect(result).toBe(0.2); // Low score for architectural theater
  });

  it('should increase fragmentation for boilerplate-barrel', () => {
    const result = adjustFragmentationForClassification(
      0.4,
      'boilerplate-barrel'
    );
    expect(result).toBeCloseTo(0.6, 2); // 0.4 * 1.5
  });

  it('should provide specific recommendations for boilerplate-barrel', () => {
    const recommendations = getClassificationRecommendations(
      'boilerplate-barrel',
      'types/domains/agent-types.ts',
      []
    );
    expect(recommendations).toContain(
      'Redundant indirection detected (architectural theater)'
    );
    expect(recommendations).toContain(
      'Remove this pass-through barrel export to reduce cognitive load'
    );
  });
});
