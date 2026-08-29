// Mock data for the Action Plan feature.
// One construct that attaches to an Account OR an Opportunity. Each entity has a
// State (the "summary") and can develop an Action Plan (summary → actions + chat).
// Frontend prototype — swap for the real State / Action Plan API later.

export type StatusColor = 'green' | 'yellow' | 'red';
export type EntityKind = 'account' | 'opportunity';

// Classification thresholds (from the State Machine config; configurable in future).
export const THRESHOLDS = { green: 0.9, yellow: 0.7 };
export const CONF_THRESHOLD = 0.7; // min confidence before the AI will plan

export function statusFor(score: number): StatusColor {
  if (score >= THRESHOLDS.green) return 'green';
  if (score >= THRESHOLDS.yellow) return 'yellow';
  return 'red';
}

// ── Dimensions per entity type ────────────────────────────────────────────────

export interface DimensionConfig {
  key: string;
  label: string;
  short: string;
  weight: number; // contribution to Overall Score (sums to 1.0)
  target: number; // Target Health from the segment config
}

// Opportunity: 6 dimensions
export const OPP_DIMENSIONS: DimensionConfig[] = [
  { key: 'qualification', label: 'Opportunity Qualification', short: 'Qualification', weight: 0.25, target: 0.9 },
  { key: 'stakeholder',   label: 'Stakeholder Relationship',  short: 'Stakeholders',  weight: 0.2,  target: 0.9 },
  { key: 'followup',      label: 'Action & Follow-up',        short: 'Follow-up',     weight: 0.15, target: 0.85 },
  { key: 'technical',     label: 'Technical Alignment',       short: 'Technical',     weight: 0.15, target: 0.85 },
  { key: 'commercial',    label: 'Commercial Alignment',      short: 'Commercial',    weight: 0.15, target: 0.9 },
  { key: 'competitive',   label: 'Competitive Context',       short: 'Competitive',   weight: 0.1,  target: 0.8 },
];

// Account: 7 dimensions
export const ACCOUNT_DIMENSIONS: DimensionConfig[] = [
  { key: 'commercial',    label: 'Commercial',                    short: 'Commercial',   weight: 0.2,  target: 0.9 },
  { key: 'adoption',      label: 'Adoption / Demand',             short: 'Adoption',     weight: 0.2,  target: 0.8 },
  { key: 'impact',        label: 'Business Impact',               short: 'Impact',       weight: 0.15, target: 0.8 },
  { key: 'quality',       label: 'Product Quality',               short: 'Quality',      weight: 0.1,  target: 0.85 },
  { key: 'service',       label: 'Operational / Service',         short: 'Service',      weight: 0.1,  target: 0.85 },
  { key: 'stakeholder',   label: 'Stakeholder Relationship',      short: 'Stakeholders', weight: 0.15, target: 0.9 },
  { key: 'context',       label: 'Customer Context & Competition',short: 'Context',      weight: 0.1,  target: 0.8 },
];

export function dimensionsFor(kind: EntityKind): DimensionConfig[] {
  return kind === 'account' ? ACCOUNT_DIMENSIONS : OPP_DIMENSIONS;
}

// ── Evidence ──────────────────────────────────────────────────────────────────

export type EvidenceKind = 'signal' | 'meeting' | 'email' | 'crm' | 'metric' | 'external';

export interface Evidence { id: string; kind: EvidenceKind; label: string; ago: string; }

export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  signal: 'Signal', meeting: 'Meeting', email: 'Email', crm: 'CRM', metric: 'Metric', external: 'External',
};

// ── State model ───────────────────────────────────────────────────────────────

export interface StateDimension {
  key: string; label: string; short: string; weight: number; target: number;
  score: number; confidence: number; summary: string; evidence: Evidence[]; lastUpdated: string;
}

export interface OverallState { score: number; confidence: number; summary: string; lastUpdated: string; }
export interface EntityState { overall: OverallState; dimensions: StateDimension[]; }

export type PlanStatus = 'none' | 'draft' | 'executing' | 'completed';

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  customer: string;      // owning account name (same as name for accounts)
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  owner: string;
  meta: { label: string; value: string }[]; // header chips (value, stage, ARR, close date…)
  state: EntityState;
  planStatus: PlanStatus;
  churnRisk?: number;    // accounts only — probability derived from the state (sigmoid)
}

export function overallScore(dims: { score: number; weight: number }[]): number {
  const total = dims.reduce((s, d) => s + d.weight, 0) || 1;
  const wsum = dims.reduce((s, d) => s + d.score * d.weight, 0);
  return Math.round((wsum / total) * 100) / 100;
}
function overallConfidence(dims: { confidence: number; weight: number }[]): number {
  const total = dims.reduce((s, d) => s + d.weight, 0) || 1;
  const wsum = dims.reduce((s, d) => s + d.confidence * d.weight, 0);
  return Math.round((wsum / total) * 100) / 100;
}

interface DimSeed { score: number; confidence: number; summary?: string; evidence?: Evidence[]; }

function buildState(kind: EntityKind, seed: Record<string, DimSeed>, overallSummary: string, updated: string): EntityState {
  const dimensions: StateDimension[] = dimensionsFor(kind).map(cfg => {
    const s = seed[cfg.key];
    return {
      key: cfg.key, label: cfg.label, short: cfg.short, weight: cfg.weight, target: cfg.target,
      score: s.score, confidence: s.confidence,
      summary: s.summary ?? defaultSummary(cfg, s.score),
      evidence: s.evidence ?? [], lastUpdated: updated,
    };
  });
  return {
    overall: { score: overallScore(dimensions), confidence: overallConfidence(dimensions), summary: overallSummary, lastUpdated: updated },
    dimensions,
  };
}

function defaultSummary(cfg: DimensionConfig, score: number): string {
  const st = statusFor(score);
  if (st === 'green') return `${cfg.short} is strong and tracking above target.`;
  if (st === 'yellow') return `${cfg.short} is progressing but below the segment target.`;
  return `${cfg.short} is a material risk and needs attention.`;
}

// churn probability via a simple sigmoid on the gap-to-target (accounts).
export function churnFromState(state: EntityState): number {
  const gap = state.dimensions.reduce((s, d) => s + Math.max(0, d.target - d.score) * d.weight, 0);
  const p = 1 / (1 + Math.exp(-(gap * 12 - 2))); // steep S-curve
  return Math.round(p * 100) / 100;
}

// ── Entities ──────────────────────────────────────────────────────────────────

// Hero OPPORTUNITY — fully authored.
const OPP_HERO_STATE = buildState('opportunity', {
  qualification: {
    score: 0.62, confidence: 0.66,
    summary: 'BANT is partially confirmed: **budget** is allocated and the **need** is well established. But the **decision process** is unclear beyond the VP of Retail, and **timeline** slipped from Q2 to Q3.',
    evidence: [
      { id: 'e1', kind: 'meeting', label: 'Quarterly review — 21 Nov', ago: '3d ago' },
      { id: 'e2', kind: 'crm', label: 'Budget: ₹1.8Cr approved', ago: '1w ago' },
    ],
  },
  stakeholder: {
    score: 0.9, confidence: 0.82,
    summary: 'Strong multi-threaded relationship with an engaged **champion** and recent **executive sponsorship** from the CTO.',
    evidence: [{ id: 'e4', kind: 'meeting', label: 'Exec briefing with CTO — 12 Oct', ago: '4w ago' }],
  },
  followup: {
    score: 0.54, confidence: 0.75,
    summary: 'Cadence has **slipped** — the pricing follow-up is 13 days overdue and no next meeting is scheduled.',
    evidence: [{ id: 'e6', kind: 'signal', label: '13 days overdue: pricing follow-up', ago: '13d ago' }],
  },
  technical: {
    score: 0.71, confidence: 0.6,
    summary: 'Solution fit is reasonable; open question on **data residency** / on-prem connectors blocks the technical evaluation.',
    evidence: [{ id: 'e8', kind: 'meeting', label: 'Technical scoping — 2 Nov', ago: '3w ago' }],
  },
  commercial: {
    score: 0.58, confidence: 0.7,
    summary: 'Commercials **not yet aligned** — the customer is contesting multi-store rollout pricing.',
    evidence: [{ id: 'e10', kind: 'email', label: 'Procurement: pricing pushback', ago: '5d ago' }],
  },
  competitive: {
    score: 0.66, confidence: 0.55,
    summary: 'An **incumbent BI vendor** is defending its footprint; IT is anchored on switching cost.',
    evidence: [{ id: 'e12', kind: 'external', label: 'Incumbent renewal due Q3', ago: '1w ago' }],
  },
}, 'This opportunity is **Red** overall (0.68), pulled below threshold by stalled momentum. Stakeholder coverage is strong, but follow-up has slipped, commercials are contested and competitive pressure is building. The highest-leverage gaps are **Follow-up** and **Commercial Alignment**.', '2 days ago');

// Hero ACCOUNT — fully authored (7 dimensions).
const ACC_HERO_STATE = buildState('account', {
  commercial: {
    score: 0.62, confidence: 0.8,
    summary: 'Renewal is on the horizon and largely healthy, but a **collections delay** on the last two invoices is dragging commercial health.',
    evidence: [{ id: 'ae1', kind: 'crm', label: 'Invoice #4471 · 22 days overdue', ago: '2d ago' }],
  },
  adoption: {
    score: 0.54, confidence: 0.66,
    summary: 'Adoption **dropped from 0.80 to 0.54** over the last month. Weekly active usage in the North region fell sharply; the cause is not yet understood.',
    evidence: [
      { id: 'ae2', kind: 'metric', label: 'WAU −31% (North region)', ago: '1w ago' },
      { id: 'ae3', kind: 'signal', label: 'Support tickets flat — not a defect', ago: '5d ago' },
    ],
  },
  impact: { score: 0.7, confidence: 0.7, summary: 'Realised value is solid where adopted, but the adoption dip is starting to erode measured business impact.' },
  quality: { score: 0.82, confidence: 0.8, summary: 'Product quality is strong; defect and reliability metrics are within target.' },
  service: { score: 0.68, confidence: 0.7, summary: 'Service responsiveness is acceptable but a few escalations have aged beyond SLA.' },
  stakeholder: {
    score: 0.9, confidence: 0.82,
    summary: 'Executive sponsorship is strong following the October business review.',
    evidence: [{ id: 'ae5', kind: 'meeting', label: 'Executive business review — Oct', ago: '5w ago' }],
  },
  context: { score: 0.66, confidence: 0.6, summary: 'A competitor is active in an adjacent business unit; an internal reorg may shift priorities.' },
}, 'This account is **Red** overall (0.69), driven almost entirely by a sharp, unexplained **Adoption** drop in the North region. Commercial is soft on collections. Stakeholder and product quality remain strong. Understanding *why* adoption fell is the priority before planning.', '1 day ago');

export const ENTITIES: Entity[] = [
  {
    id: 'opp-reliance-analytics', kind: 'opportunity',
    name: 'Store Analytics Suite — 240 store rollout',
    customer: 'Reliance Digital', segment: 'Enterprise', owner: 'Ananya Mehta',
    meta: [{ label: 'Value', value: '₹1.8 Cr' }, { label: 'Stage', value: 'Proposal' }, { label: 'Target close', value: '15 Sep 2026' }],
    state: OPP_HERO_STATE, planStatus: 'none',
  },
  {
    id: 'opp-tataneu-loyalty', kind: 'opportunity',
    name: 'Loyalty personalization engine',
    customer: 'Tata Neu', segment: 'Enterprise', owner: 'Rohan Desai',
    meta: [{ label: 'Value', value: '₹2.4 Cr' }, { label: 'Stage', value: 'Negotiation' }, { label: 'Target close', value: '30 Aug 2026' }],
    state: buildState('opportunity', {
      qualification: { score: 0.88, confidence: 0.85 }, stakeholder: { score: 0.92, confidence: 0.88 },
      followup: { score: 0.9, confidence: 0.8 }, technical: { score: 0.86, confidence: 0.82 },
      commercial: { score: 0.84, confidence: 0.78 }, competitive: { score: 0.82, confidence: 0.72 },
    }, 'Healthy, late-stage opportunity. All dimensions at or near target with strong confidence. Commercial terms are the last mile.', '1 day ago'),
    planStatus: 'executing',
  },
  {
    id: 'acc-reliance', kind: 'account',
    name: 'Reliance Digital', customer: 'Reliance Digital', segment: 'Enterprise', owner: 'Ananya Mehta',
    meta: [{ label: 'ARR', value: '₹6.2 Cr' }, { label: 'Renewal', value: 'Mar 2027' }, { label: 'Tenure', value: '3 yrs' }],
    state: ACC_HERO_STATE, planStatus: 'none', churnRisk: churnFromState(ACC_HERO_STATE),
  },
  {
    id: 'acc-tataneu', kind: 'account',
    name: 'Tata Neu', customer: 'Tata Neu', segment: 'Enterprise', owner: 'Rohan Desai',
    meta: [{ label: 'ARR', value: '₹9.1 Cr' }, { label: 'Renewal', value: 'Aug 2026' }, { label: 'Tenure', value: '4 yrs' }],
    state: buildState('account', {
      commercial: { score: 0.92, confidence: 0.85 }, adoption: { score: 0.9, confidence: 0.82 },
      impact: { score: 0.9, confidence: 0.8 }, quality: { score: 0.92, confidence: 0.85 },
      service: { score: 0.9, confidence: 0.82 }, stakeholder: { score: 0.94, confidence: 0.88 },
      context: { score: 0.88, confidence: 0.78 },
    }, 'A **Green**, well-run account. Every dimension at or above target with high confidence. Maintain cadence into the August renewal.', '2 days ago'),
    planStatus: 'none',
  },
];

export function getEntity(id: string): Entity | undefined {
  return ENTITIES.find(e => e.id === id);
}

// ── Action Plan (targets → actions) + Collaborative Reasoning ─────────────────

export interface ReasoningGap {
  id: string;
  dimensionKey: string;
  gap: string;
  question: string;
  suggestions: string[];
  raisesConfidenceTo: number;
  raisesScoreTo?: number;
}

export type ActionComplexity = 'Low' | 'Medium' | 'High';

export interface ActionItem {
  id: string;
  action: string;
  rationale: string;
  dimensionKey: string;
  impact: number;
  complexity: ActionComplexity;
  targetDate: string;
  assignedTo?: string;
  fromInitiative?: string;
}

export interface PortfolioInitiative {
  id: string;
  name: string;
  contributesTo: { dimensionKey: string; delta: number }[];
}

export interface PlanSeed {
  targetCompletion: string;
  document: string;
  reasoningGaps: ReasoningGap[];
  actions: ActionItem[];
  initiative?: PortfolioInitiative;
}

// Authored plan for the hero OPPORTUNITY.
const OPP_HERO_PLAN: PlanSeed = {
  targetCompletion: '31 Aug 2026',
  initiative: { id: 'init-exec', name: 'Executive Sponsorship Program', contributesTo: [{ dimensionKey: 'stakeholder', delta: 0.05 }] },
  reasoningGaps: [
    { id: 'g1', dimensionKey: 'competitive', gap: 'Competitive confidence is low (0.55). I don’t know how serious the incumbent threat is.', question: 'How real is the incumbent BI vendor threat? Has anyone signalled a preference to stay with them?', suggestions: ['Incumbent is default choice for IT', 'Customer is actively evaluating us', 'Not sure — check with champion'], raisesConfidenceTo: 0.82, raisesScoreTo: 0.6 },
    { id: 'g2', dimensionKey: 'technical', gap: 'Technical confidence is low (0.60). The data-residency question is unresolved.', question: 'Do they need on-prem connectors, or is hybrid-cloud acceptable for their data-residency policy?', suggestions: ['Hybrid cloud is acceptable', 'On-prem is a hard requirement', 'Unknown — legal reviewing'], raisesConfidenceTo: 0.85, raisesScoreTo: 0.78 },
    { id: 'g3', dimensionKey: 'qualification', gap: 'Decision process is unconfirmed beyond the VP of Retail.', question: 'Who else must approve an ₹1.8Cr spend, and has procurement confirmed the sign-off chain?', suggestions: ['CFO sign-off required above ₹1Cr', 'VP of Retail is the economic buyer', 'Still confirming with champion'], raisesConfidenceTo: 0.9 },
  ],
  actions: [
    { id: 'a1', action: 'Schedule pricing alignment call with procurement', rationale: 'Pricing follow-up is 13 days overdue and commercials are the biggest gap. Re-establishing cadence lifts Follow-up and unblocks Commercial.', dimensionKey: 'commercial', impact: 0.2, complexity: 'Low', targetDate: '12 Aug 2026', assignedTo: 'Ananya Mehta' },
    { id: 'a2', action: 'Send revised multi-store pricing with volume tiers', rationale: 'An internally-approved volume-tier proposal closes the commercial gap and pre-empts the competitor discount.', dimensionKey: 'commercial', impact: 0.18, complexity: 'Medium', targetDate: '20 Aug 2026' },
    { id: 'a3', action: 'Run competitive differentiation session with IT', rationale: 'IT is anchored on the incumbent’s switching cost. A focused ROI session neutralises the competitive risk.', dimensionKey: 'competitive', impact: 0.15, complexity: 'Medium', targetDate: '25 Aug 2026' },
    { id: 'a4', action: 'Confirm technical deployment model (data residency)', rationale: 'Unblocks the technical evaluation; the technical score and confidence both rise once settled.', dimensionKey: 'technical', impact: 0.1, complexity: 'Low', targetDate: '18 Aug 2026' },
    { id: 'a5', action: 'Map full sign-off chain with champion', rationale: 'Confirming approvers de-risks the close and firms up the timeline.', dimensionKey: 'qualification', impact: 0.12, complexity: 'Low', targetDate: '14 Aug 2026', fromInitiative: 'Executive Sponsorship Program' },
  ],
  document: `## Objective
Move **Store Analytics Suite** from a stalled Red (0.68) to a confident, closeable position (≥ 0.85) ahead of the 15 Sep target close.

## Business challenges
- Momentum has stalled — the pricing follow-up is 13 days overdue with no next meeting booked.
- Commercials are contested on the multi-store rollout.
- The incumbent BI vendor is defending its footprint and IT is anchored on switching cost.

## Target outcomes
- Re-establish weekly cadence and close the pricing gap.
- Land an internally-approved volume-tier commercial proposal.
- Neutralise the competitive threat with an ROI session for IT.

## Strategy
Front-load the low-complexity, high-impact moves (re-open cadence, confirm sign-off chain, settle deployment model), then bring the commercial proposal and competitive session in parallel. The **Executive Sponsorship Program** already contributes to stakeholder strength, so this plan addresses only the remaining Commercial, Competitive and Follow-up gaps.`,
};

// Authored plan for the hero ACCOUNT — mirrors Girish's adoption example.
const ACC_HERO_PLAN: PlanSeed = {
  targetCompletion: '30 Sep 2026',
  initiative: { id: 'init-adopt', name: 'Product Adoption Campaign', contributesTo: [{ dimensionKey: 'adoption', delta: 0.06 }] },
  reasoningGaps: [
    { id: 'ag1', dimensionKey: 'adoption', gap: 'Adoption dropped 0.80 → 0.54 in the North region and I don’t yet understand why. It could be a people change, a process change, or a seasonal dip.', question: 'What’s behind the North-region adoption drop? Any of these?', suggestions: ['Key champion changed roles', 'Their internal process changed', 'Holiday / seasonal slowdown'], raisesConfidenceTo: 0.85, raisesScoreTo: 0.6 },
    { id: 'ag2', dimensionKey: 'commercial', gap: 'Two invoices are overdue — is this a dispute or just an AP delay?', question: 'Are the overdue invoices a genuine dispute, or a routine accounts-payable delay?', suggestions: ['Routine AP delay', 'Disputed — pricing query', 'Not sure — finance checking'], raisesConfidenceTo: 0.86 },
    { id: 'ag3', dimensionKey: 'context', gap: 'A competitor is active in an adjacent BU and there may be a reorg.', question: 'Is the competitor gaining ground, and does the reorg change our sponsor’s remit?', suggestions: ['Competitor is a real threat', 'Sponsor’s remit unaffected', 'Need to confirm internally'], raisesConfidenceTo: 0.8 },
  ],
  actions: [
    { id: 'aa1', action: 'Run a usage-driver analysis for the North region', rationale: 'Pinpoints whether the drop is a people, process or seasonal cause before we intervene — the biggest gap on the account.', dimensionKey: 'adoption', impact: 0.18, complexity: 'Low', targetDate: '20 Aug 2026', assignedTo: 'Ananya Mehta' },
    { id: 'aa2', action: 'Re-onboard the North-region team with a refresher enablement', rationale: 'If a champion changed roles, a targeted refresher restores active usage fastest.', dimensionKey: 'adoption', impact: 0.14, complexity: 'Medium', targetDate: '05 Sep 2026', fromInitiative: 'Product Adoption Campaign' },
    { id: 'aa3', action: 'Resolve the overdue invoices with AP', rationale: 'Clears the collections drag on commercial health and removes a renewal risk.', dimensionKey: 'commercial', impact: 0.16, complexity: 'Low', targetDate: '15 Aug 2026' },
    { id: 'aa4', action: 'Executive check-in to confirm sponsor remit post-reorg', rationale: 'Protects the strong stakeholder position against the pending reorg and competitor activity.', dimensionKey: 'context', impact: 0.1, complexity: 'Low', targetDate: '28 Aug 2026' },
  ],
  document: `## Objective
Recover **Reliance Digital** from Red (0.69) to a healthy Green by restoring North-region adoption and clearing the commercial drag, ahead of the March 2027 renewal.

## Business challenges
- Adoption fell 0.80 → 0.54 in the North region — cause unconfirmed.
- Two invoices are overdue, softening commercial health.
- A competitor is active in an adjacent BU and a reorg is pending.

## Target outcomes
- Diagnose and reverse the adoption drop.
- Clear overdue collections.
- Protect executive sponsorship through the reorg.

## Strategy
Diagnose before intervening: a usage-driver analysis first, then the right adoption fix. Clear the invoices in parallel (low effort, removes renewal risk). The **Product Adoption Campaign** portfolio initiative contributes to adoption, so the plan closes only the remaining gap.`,
};

export function getPlanSeed(entity: Entity): PlanSeed {
  if (entity.id === 'opp-reliance-analytics') return OPP_HERO_PLAN;
  if (entity.id === 'acc-reliance') return ACC_HERO_PLAN;
  return generatePlanSeed(entity);
}

function generatePlanSeed(entity: Entity): PlanSeed {
  const dims = [...entity.state.dimensions].sort((a, b) => (a.score - a.target) - (b.score - b.target));
  const lowConf = dims.filter(d => d.confidence < CONF_THRESHOLD).slice(0, 3);
  const gaps: ReasoningGap[] = lowConf.map((d, i) => ({
    id: `gg${i}`, dimensionKey: d.key,
    gap: `Confidence in ${d.short} is ${d.confidence.toFixed(2)} — below the threshold to plan reliably.`,
    question: `What’s the latest on ${d.short.toLowerCase()} for ${entity.customer}?`,
    suggestions: ['Recent positive development', 'No change', 'Need to check internally'],
    raisesConfidenceTo: Math.min(0.9, d.confidence + 0.25),
    raisesScoreTo: d.score < d.target ? Math.min(d.target, d.score + 0.08) : undefined,
  }));
  const gapDims = dims.filter(d => d.score < d.target).slice(0, 4);
  const actions: ActionItem[] = gapDims.map((d, i) => ({
    id: `ga${i}`, action: `Close the ${d.short} gap for ${entity.customer}`,
    rationale: `${d.short} is ${d.score.toFixed(2)} against a ${d.target.toFixed(2)} target — one of the larger gaps.`,
    dimensionKey: d.key, impact: Math.round((d.target - d.score) * 0.6 * 100) / 100,
    complexity: (['Low', 'Medium', 'High'] as ActionComplexity[])[i % 3], targetDate: entity.meta.find(m => /close|renewal/i.test(m.label))?.value ?? '30 Sep 2026',
  }));
  return {
    targetCompletion: entity.meta.find(m => /close|renewal/i.test(m.label))?.value ?? '30 Sep 2026',
    reasoningGaps: gaps, actions,
    document: `## Objective\nImprove **${entity.name}** for ${entity.customer} toward the segment target.\n\n## Strategy\nPrioritise the largest gaps first, front-loading low-complexity actions before more complex interventions.`,
  };
}

// ── Avatars / formatting / tokens ─────────────────────────────────────────────

const AVATAR_COLORS = ['#F59E0B', '#3B6FF6', '#10B981', '#8B5CF6', '#EC4899', '#0EA5E9'];
export function avatarFor(name: string): { initials: string; color: string } {
  const parts = name.split(' ').filter(Boolean);
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) | 0;
  return { initials: initials.toUpperCase(), color: AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] };
}

export const STATUS_HEX: Record<StatusColor, { text: string; bg: string; border: string; dot: string }> = {
  green:  { text: '#249782', bg: '#E7F6F0', border: '#B7E4D3', dot: '#10B981' },
  yellow: { text: '#B45309', bg: '#FEF6E7', border: '#FCE4B6', dot: '#F59E0B' },
  red:    { text: '#E02424', bg: '#FDECEC', border: '#FAD1D1', dot: '#EF4444' },
};
export const STATUS_LABEL: Record<StatusColor, string> = { green: 'Green', yellow: 'Yellow', red: 'Red' };

export const DIMENSION_BY_KEY_ALL: Record<string, DimensionConfig> = Object.fromEntries(
  [...OPP_DIMENSIONS, ...ACCOUNT_DIMENSIONS].map(d => [d.key, d]),
);
