/**
 * CombinatorX: Mathematical Engine & Core Logic
 * 
 * Formal Discrete Mathematics and Graph Theory (DMGT) implementation:
 * 1. Ordinary Generating Functions (OGFs)
 * 2. Linear Recurrence Solvers
 * 3. Companion Matrix Exponentiation (O(k^3 log n))
 * 4. Naive Depth-First Search (O(|S|^n))
 * 5. Dynamic Programming Baseline (O(n * |S|))
 * 6. Dominant Root & Asymptotic Growth Analysis
 */

export interface MatrixResult {
  paths: bigint;
  executionTimeMs: number;
  matrixMultiplications: number;
  companionDimension: number;
  algorithm: 'matrix';
}

export interface DFSResult {
  paths: number;
  executionTimeMs: number;
  recursiveCalls: number;
  timedOut: boolean;
  algorithm: 'dfs';
}

export interface DPResult {
  paths: bigint;
  executionTimeMs: number;
  tableSize: number;
  algorithm: 'dp';
}

export type CalculationResult = MatrixResult | DFSResult | DPResult;

export interface BenchmarkDataPoint {
  depth: number;
  matrixTimeMs: number;
  dfsTimeMs: number | null;
  dpTimeMs: number;
  pathsCount: string;
  dfsCallCount?: number;
}

/**
 * Creates a dim x dim identity matrix in BigInt
 */
export function createIdentityMatrix(dim: number): bigint[][] {
  const I: bigint[][] = [];
  for (let i = 0; i < dim; i++) {
    const row = new Array<bigint>(dim).fill(0n);
    row[i] = 1n;
    I.push(row);
  }
  return I;
}

/**
 * Multiplies two square BigInt matrices A and B of size dim x dim
 */
export function multiplyMatrices(A: bigint[][], B: bigint[][], dim: number): bigint[][] {
  const C: bigint[][] = [];
  for (let i = 0; i < dim; i++) {
    const row = new Array<bigint>(dim).fill(0n);
    for (let k = 0; k < dim; k++) {
      if (A[i][k] === 0n) continue;
      const aik = A[i][k];
      for (let j = 0; j < dim; j++) {
        row[j] += aik * B[k][j];
      }
    }
    C.push(row);
  }
  return C;
}

/**
 * Builds the Companion Matrix M for the recurrence:
 * a_n = sum_{s in S} a_{n-s}
 * 
 * Vector convention:
 * v_t = [a_t, a_{t-1}, ..., a_{t-k+1}]^T
 * 
 * Row 0: M[0][j] = 1 if (j + 1) in S else 0
 * Row i (for i >= 1): M[i][i - 1] = 1, all others 0
 */
export function buildCompanionMatrix(S: number[]): { matrix: bigint[][]; dim: number } {
  if (S.length === 0) {
    return { matrix: [[0n]], dim: 1 };
  }
  const k = Math.max(...S);
  const dim = k;
  const sSet = new Set(S);

  const M: bigint[][] = [];
  // Row 0
  const row0 = new Array<bigint>(dim).fill(0n);
  for (let j = 0; j < dim; j++) {
    if (sSet.has(j + 1)) {
      row0[j] = 1n;
    }
  }
  M.push(row0);

  // Shift rows 1 .. dim-1
  for (let i = 1; i < dim; i++) {
    const row = new Array<bigint>(dim).fill(0n);
    row[i - 1] = 1n;
    M.push(row);
  }

  return { matrix: M, dim };
}

/**
 * Matrix Exponentiation in O(k^3 * log n)
 * Computes exact number of paths a_n for any depth n (even n = 10,000+)
 */
export function countPathsMatrix(n: number, S: number[]): MatrixResult {
  const t0 = performance.now();
  if (n < 0 || S.length === 0) {
    return {
      paths: 0n,
      executionTimeMs: performance.now() - t0,
      matrixMultiplications: 0,
      companionDimension: 0,
      algorithm: 'matrix',
    };
  }
  if (n === 0) {
    return {
      paths: 1n,
      executionTimeMs: performance.now() - t0,
      matrixMultiplications: 0,
      companionDimension: Math.max(1, ...S),
      algorithm: 'matrix',
    };
  }

  const { matrix: M, dim } = buildCompanionMatrix(S);
  let multCount = 0;

  // Binary exponentiation M^n
  let result = createIdentityMatrix(dim);
  let base = M;
  let exp = n;

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = multiplyMatrices(result, base, dim);
      multCount++;
    }
    exp = Math.floor(exp / 2);
    if (exp > 0) {
      base = multiplyMatrices(base, base, dim);
      multCount++;
    }
  }

  // v_n = M^n * v_0, where v_0 = [1, 0, 0, ...]^T
  // Therefore, a_n = result[0][0] * 1n = result[0][0]
  const paths = result[0][0];
  const t1 = performance.now();

  return {
    paths,
    executionTimeMs: Math.max(0.001, t1 - t0),
    matrixMultiplications: multCount,
    companionDimension: dim,
    algorithm: 'matrix',
  };
}

/**
 * Naive Depth-First Search (DFS) Brute-Force
 * Time complexity: O(|S|^n)
 * Recursively branches for each skip step in S until target layer is reached.
 * Includes safety call limit and timeout to protect browser UI thread.
 */
export function countPathsDFS(
  targetDepth: number,
  S: number[],
  maxCalls = 20_000_000,
  maxTimeMs = 2500
): DFSResult {
  const t0 = performance.now();
  let calls = 0;
  let paths = 0;
  let timedOut = false;

  const validS = S.filter((s) => s > 0).sort((a, b) => a - b);
  if (targetDepth === 0) {
    return {
      paths: 1,
      executionTimeMs: performance.now() - t0,
      recursiveCalls: 1,
      timedOut: false,
      algorithm: 'dfs',
    };
  }
  if (validS.length === 0 || targetDepth < 0) {
    return {
      paths: 0,
      executionTimeMs: performance.now() - t0,
      recursiveCalls: 0,
      timedOut: false,
      algorithm: 'dfs',
    };
  }

  function dfs(currentDepth: number): void {
    if (timedOut) return;
    calls++;
    if (calls > maxCalls || (calls % 50000 === 0 && performance.now() - t0 > maxTimeMs)) {
      timedOut = true;
      return;
    }

    for (let i = 0; i < validS.length; i++) {
      const step = validS[i];
      const nextDepth = currentDepth + step;
      if (nextDepth === targetDepth) {
        paths++;
      } else if (nextDepth < targetDepth) {
        dfs(nextDepth);
        if (timedOut) return;
      }
    }
  }

  dfs(0);
  const t1 = performance.now();

  return {
    paths,
    executionTimeMs: t1 - t0,
    recursiveCalls: calls,
    timedOut,
    algorithm: 'dfs',
  };
}

/**
 * Dynamic Programming (O(n * |S|))
 * Calculates exact paths using linear table memoization with BigInt.
 */
export function countPathsDP(targetDepth: number, S: number[]): DPResult {
  const t0 = performance.now();
  if (targetDepth < 0 || S.length === 0) {
    return {
      paths: 0n,
      executionTimeMs: performance.now() - t0,
      tableSize: 0,
      algorithm: 'dp',
    };
  }
  if (targetDepth === 0) {
    return {
      paths: 1n,
      executionTimeMs: performance.now() - t0,
      tableSize: 1,
      algorithm: 'dp',
    };
  }

  const validS = S.filter((s) => s > 0);
  const dp: bigint[] = new Array(targetDepth + 1).fill(0n);
  dp[0] = 1n;

  for (let i = 1; i <= targetDepth; i++) {
    let sum = 0n;
    for (const step of validS) {
      if (i - step >= 0) {
        sum += dp[i - step];
      }
    }
    dp[i] = sum;
  }

  const t1 = performance.now();
  return {
    paths: dp[targetDepth],
    executionTimeMs: Math.max(0.001, t1 - t0),
    tableSize: targetDepth + 1,
    algorithm: 'dp',
  };
}

/**
 * Ordinary Generating Function (OGF) String Formatter
 * Produces LaTeX and plain-text rational expressions:
 * A(x) = 1 / (1 - sum_{s in S} x^s)
 */
export function formatOGF(S: number[]): {
  rationalExpression: string;
  latexExpression: string;
  denominatorFormula: string;
  characteristicPolynomial: string;
} {
  const sorted = [...S].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return {
      rationalExpression: 'A(x) = 1',
      latexExpression: 'A(x) = 1',
      denominatorFormula: '1',
      characteristicPolynomial: '\\lambda = 0',
    };
  }

  const terms = sorted.map((s) => (s === 1 ? 'x' : `x^${s}`));
  const denom = `1 - (${terms.join(' + ')})`;
  const denomLatex = `1 - \\sum_{s \\in S} x^s = 1 - (${sorted.map((s) => (s === 1 ? 'x' : `x^{${s}}`)).join(' + ')})`;

  const k = sorted[sorted.length - 1];
  const charTerms = sorted.map((s) => {
    const p = k - s;
    if (p === 0) return '1';
    if (p === 1) return '\\lambda';
    return `\\lambda^{${p}}`;
  });
  const charPoly = `P(\\lambda) = \\lambda^{${k}} - (${charTerms.join(' + ')}) = 0`;

  return {
    rationalExpression: `A(x) = 1 / (${denom})`,
    latexExpression: `A(x) = \\frac{1}{1 - \\sum_{s \\in S} x^s}`,
    denominatorFormula: denomLatex,
    characteristicPolynomial: charPoly,
  };
}

/**
 * Calculates dominant root (approximate growth base rho)
 * using Newton-Raphson on characteristic equation:
 * lambda^k - sum_{s in S} lambda^{k-s} = 0
 */
export function computeDominantRoot(S: number[]): number {
  if (S.length === 0) return 0;
  const sorted = [...S].sort((a, b) => a - b);
  const k = sorted[sorted.length - 1];
  if (k === 1) return 1.0;

  // Let f(L) = 1 - sum_{s in S} L^(-s)
  // Root of f(L) = 0 is dominant eigenvalue
  let L = 2.0; // Initial guess
  for (let iter = 0; iter < 100; iter++) {
    let fVal = 1.0;
    let fDeriv = 0.0;
    for (const s of sorted) {
      const invPow = Math.pow(L, -s);
      fVal -= invPow;
      fDeriv += s * Math.pow(L, -s - 1);
    }
    if (Math.abs(fVal) < 1e-12) break;
    if (Math.abs(fDeriv) < 1e-14) break;
    const nextL = L - fVal / fDeriv;
    if (isNaN(nextL) || nextL <= 1.0) {
      L = (L + 1.0) / 2;
    } else {
      L = nextL;
    }
  }
  return Number.isFinite(L) ? L : 1.0;
}

/**
 * Samples valid paths for the Visual Topology Explorer
 * Returns up to maxPaths paths as arrays of layer indices [0, ..., n]
 */
export function samplePaths(targetDepth: number, S: number[], maxPaths = 12): number[][] {
  const sorted = [...S].sort((a, b) => a - b);
  const paths: number[][] = [];

  function backtrack(currentPath: number[], currentDepth: number): void {
    if (paths.length >= maxPaths) return;
    if (currentDepth === targetDepth) {
      paths.push([...currentPath]);
      return;
    }
    for (const step of sorted) {
      if (currentDepth + step <= targetDepth) {
        currentPath.push(currentDepth + step);
        backtrack(currentPath, currentDepth + step);
        currentPath.pop();
        if (paths.length >= maxPaths) return;
      }
    }
  }

  backtrack([0], 0);
  return paths;
}

/**
 * Detailed breakdown per layer for the Engineering Inspector Table
 */
export interface LayerProfile {
  layer: number;
  pathsToLayer: bigint;
  inDegree: number;
  outDegree: number;
  incomingFrom: number[];
  outgoingTo: number[];
}

export function getLayerProfiles(maxDepth: number, S: number[]): LayerProfile[] {
  const sorted = [...S].sort((a, b) => a - b);
  const profiles: LayerProfile[] = [];

  // Compute DP table for exact paths
  const dp: bigint[] = new Array(maxDepth + 1).fill(0n);
  dp[0] = 1n;
  for (let i = 1; i <= maxDepth; i++) {
    let sum = 0n;
    for (const s of sorted) {
      if (i - s >= 0) sum += dp[i - s];
    }
    dp[i] = sum;
  }

  for (let i = 0; i <= maxDepth; i++) {
    const incoming: number[] = [];
    const outgoing: number[] = [];
    for (const s of sorted) {
      if (i - s >= 0) incoming.push(i - s);
      if (i + s <= maxDepth) outgoing.push(i + s);
    }
    profiles.push({
      layer: i,
      pathsToLayer: dp[i],
      inDegree: incoming.length,
      outDegree: outgoing.length,
      incomingFrom: incoming,
      outgoingTo: outgoing,
    });
  }

  return profiles;
}

/**
 * Generates CSV string for benchmark export
 */
export function exportBenchmarkCSV(data: BenchmarkDataPoint[]): string {
  const headers = "Depth_n,Matrix_Time_ms,DFS_Time_ms,DP_Time_ms,Valid_Topologies_an,DFS_Call_Count";
  const rows = data.map((d) => 
    `${d.depth},${d.matrixTimeMs},${d.dfsTimeMs ?? "N/A"},${d.dpTimeMs},"${d.pathsCount}",${d.dfsCallCount ?? "N/A"}`
  );
  return [headers, ...rows].join("\n");
}

/**
 * Formats large BigInt numbers into readable compact or scientific format
 */
export function formatBigInt(val: bigint): { full: string; scientific: string; digits: number } {
  const str = val.toString();
  const digits = str.length;
  if (digits <= 12) {
    return {
      full: Number(val).toLocaleString(),
      scientific: Number(val).toLocaleString(),
      digits,
    };
  }
  const leading = `${str[0]}.${str.slice(1, 4)}`;
  const exp = digits - 1;
  return {
    full: str,
    scientific: `${leading} × 10^${exp}`,
    digits,
  };
}

