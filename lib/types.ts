export type AlgorithmType = 'matrix' | 'dfs' | 'dp';

export interface PresetConfig {
  id: string;
  name: string;
  tag: string;
  architecture: string;
  description: string;
  depth: number;
  skipSet: number[];
  citation: string;
}

export const PRESETS: PresetConfig[] = [
  {
    id: 'resnet34',
    name: 'ResNet-34 Standard',
    tag: 'Classic Residual',
    architecture: 'Computer Vision (CV)',
    description: 'Standard 2-layer residual building blocks. Signal can pass through conv layers (+1) or skip identity shortcut (+2).',
    depth: 34,
    skipSet: [1, 2],
    citation: 'He et al., 2015 (CVPR)',
  },
  {
    id: 'transformer',
    name: 'Transformer Sub-Layer Stream',
    tag: 'Attention + MLP',
    architecture: 'Large Language Models (LLM)',
    description: 'Multi-Head Attention and Feedforward MLP residual streams allowing 1-layer and 2-layer lookaheads.',
    depth: 48,
    skipSet: [1, 2, 3],
    citation: 'Vaswani et al., 2017 (NeurIPS)',
  },
  {
    id: 'densenet',
    name: 'DenseNet Multi-Skip',
    tag: 'Dense Connectivity',
    architecture: 'Deep Feature Reuse',
    description: 'Dense connectivity graph where each layer receives direct forward projections from up to 4 preceding layers.',
    depth: 24,
    skipSet: [1, 2, 3, 4],
    citation: 'Huang et al., 2017 (CVPR Best Paper)',
  },
  {
    id: 'dilated',
    name: 'Dilated WaveNet Residual',
    tag: 'Dilated Conv',
    architecture: 'Audio / Sequential',
    description: 'Exponential receptive field expansion with dyadic dilation skip connections [1, 2, 4, 8].',
    depth: 32,
    skipSet: [1, 2, 4, 8],
    citation: 'Oord et al., 2016 (DeepMind)',
  },
  {
    id: 'sparse',
    name: 'Parity Gated Highway',
    tag: 'Sparse Highway',
    architecture: 'Recurrent / Gated',
    description: 'Odd-distance routing paths only [1, 3, 5], demonstrating parity-constrained topology routing.',
    depth: 27,
    skipSet: [1, 3, 5],
    citation: 'Srivastava et al., 2015',
  },
  {
    id: 'extreme',
    name: 'Ultra-Deep Scalability Benchmark',
    tag: 'Extreme Stress Test',
    architecture: 'Theoretical Limit',
    description: 'Validates O(k³ log n) logarithmic companion matrix exponentiation on massive depth (n = 10,000) using arbitrary-precision BigInt.',
    depth: 10000,
    skipSet: [1, 2, 4],
    citation: 'DMGT Analytic Combinatorics',
  },
];
