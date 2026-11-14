# CombinatorX: Neural Skip-Connection Topology Engine

A web application demonstrating the application of **Discrete Mathematics and Graph Theory (DMGT)**—specifically **Ordinary Generating Functions (OGFs)**, **linear recurrences**, and **companion matrix exponentiation**—to count and analyze valid neural network skip-connection routing topologies.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Recharts**, styled with a **Dark Mode Engineering Lab** aesthetic.

---

## 🔬 Mathematical Formulation

### 1. Topological Routing Definition
Consider a feedforward neural network comprising layers indexed $0, 1, 2, \dots, n$.
Forward signal propagation is constrained to skip distances from set $S = \{s_1, s_2, \dots, s_k\}$ where each $s_i \in \mathbb{Z}^+$.

A valid routing pathway is a composition of forward hops:
$$h_1 + h_2 + \dots + h_m = n, \quad \text{where } h_j \in S$$

The number of valid routing pathways $a_n$ satisfies the homogeneous linear recurrence:
$$a_n = \sum_{s \in S} a_{n-s}$$
with boundary conditions $a_0 = 1$ and $a_{k < 0} = 0$.

### 2. Rational Ordinary Generating Function (OGF)
Multiplying by $x^n$ and summing over $n \ge 1$:
$$A(x) = \sum_{n=0}^\infty a_n x^n = 1 + \sum_{s \in S} x^s A(x) \implies A(x) = \frac{1}{1 - \sum_{s \in S} x^s}$$

- For $S = \{1, 2\}$ (Standard ResNet shortcut): $A(x) = \frac{1}{1 - x - x^2}$ (Fibonacci sequence shifted $F_{n+1}$).
- For $S = \{1, 2, 3\}$ (Dense multi-hop): $A(x) = \frac{1}{1 - x - x^2 - x^3}$ (Tribonacci sequence).

### 3. $O(k^3 \log n)$ Companion Matrix Binary Exponentiation
Let $k = \max(S)$. We define the state column vector:
$$\mathbf{v}_n = \begin{bmatrix} a_n \\ a_{n-1} \\ \vdots \\ a_{n-k+1} \end{bmatrix}$$

The state transition is given by $\mathbf{v}_{n+1} = M \mathbf{v}_n$, where $M$ is the $k \times k$ companion matrix:
- **Row 0:** $M[0][j] = 1$ if $(j + 1) \in S$, else $0$.
- **Row $i$ ($i \ge 1$):** $M[i][i - 1] = 1$, all other entries $0$.

Thus:
$$\mathbf{v}_n = M^n \mathbf{v}_0 = M^n \begin{bmatrix} 1 \\ 0 \\ \vdots \\ 0 \end{bmatrix}$$
The exact number of paths $a_n$ is the top-left element $(M^n)_{0,0}$. Binary exponentiation computes this in $O(k^3 \log n)$ operations using arbitrary-precision `BigInt` arithmetic, allowing instantaneous evaluation even for $n = 10,000+$.

---

## ⚡ Algorithmic Comparison

| Algorithm | Time Complexity | Space Complexity | Practical Limit ($n$) |
| :--- | :--- | :--- | :--- |
| **OGF Companion Matrix** | $\mathcal{O}(k^3 \log n)$ | $\mathcal{O}(k^2)$ | $n > 100,000+$ (Instant) |
| **Dynamic Programming** | $\mathcal{O}(n \cdot \|S\|)$ | $\mathcal{O}(n)$ | $n \approx 10^7$ |
| **Naive DFS Brute-Force** | $\mathcal{O}(\|S\|^n)$ | $\mathcal{O}(n)$ stack | $n \approx 30$ (Explosion) |

---

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. To build for production:
```bash
npm run build
npm run start
```

---

## 🗂 Project File Structure

```
├── app/
│   ├── globals.css           # Engineering Lab dark mode styling & grid glow
│   ├── layout.tsx            # HTML root & metadata configuration
│   └── page.tsx              # Main dashboard connecting telemetry, controls & viz
├── components/
│   ├── BenchmarkSuite.tsx    # Recharts comparison suite (Linear & Log scale)
│   ├── ControlPanel.tsx      # Depth slider, skip-step checkboxes & presets
│   ├── Header.tsx            # Lab title, DMGT status & theory launcher
│   ├── MathBreakdown.tsx     # OGF, companion matrix display & Deep Learning tabs
│   ├── TelemetryCards.tsx    # Realtime metric telemetry cards (a_n, latency, rho)
│   ├── TheoryModal.tsx       # Theoretical documentation modal
│   └── VisualTopology.tsx    # Directed Acyclic Graph (DAG) layer skip visualizer
├── lib/
│   ├── math-engine.ts        # Companion matrix, BigInt exponentiation, DFS, DP & OGF
│   └── types.ts              # Preset definitions & TypeScript interfaces
├── next.config.mjs           # Next.js configuration
├── package.json              # Project dependencies and scripts
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.ts        # Dark Mode Lab palette and glow shadows
└── tsconfig.json             # TypeScript configuration targeting ES2022
```

