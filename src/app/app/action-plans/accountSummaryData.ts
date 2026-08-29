// Mock data for the Customer account "Summary" tab + its Action Plan.
// Matches the Figma: health gauge + narrative + dimension list → Review & act →
// action plan page (current-state accordion / actions / agent chat).
// Frontend prototype — swap for the real State / Action Plan API later.

export type Status = 'red' | 'yellow' | 'green';

export const STATUS_HEX: Record<Status, { text: string; dot: string; bg: string; border: string }> = {
  red:    { text: '#DC2626', dot: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
  yellow: { text: '#CA8A04', dot: '#EAB308', bg: '#FEFCE8', border: '#FDE047' },
  green:  { text: '#059669', dot: '#10B981', bg: '#ECFDF5', border: '#6EE7B7' },
};

export function statusFor(score: number): Status {
  if (score >= 0.85) return 'green';
  if (score >= 0.7) return 'yellow';
  return 'red';
}

export interface SummaryDimension {
  key: string;
  label: string;
  score: number;
  target: number;
  status: Status;
  issue: string;               // one-line issue for the Summary list
  // Rich detail for the action-plan "Current state" accordion:
  flagged: string;             // e.g. "At Risk"
  narrative: string;
  breakdown: { label: string; text: string }[];   // Key Breakdown & Impact
  recommended: { label: string; text: string }[]; // Recommended Action Plan
}

export interface ActionItem {
  id: string;
  action: string;
  rationale: string;
  dimension: string;
  impact: number;
  date: string;
  assignee: string;
  taskLinked?: boolean;
}

export interface ReasoningGap {
  id: string;
  dimensionKey: string;
  question: string;
  suggestions: string[];
}

export interface AccountSummary {
  id: string;
  name: string;
  nps: number;
  accountType: string;         // "Standard account"
  care: string;                // "Hypercare"
  renewal: string;             // "Renewal on, July 15"
  pillars: { label: string; status: Status }[];
  healthScore: number;
  weightedTarget: number;
  narrative: string;           // the summary paragraph
  overallState: string;        // one-line state used on the plan page
  dimensions: SummaryDimension[];
  // Action plan:
  planFrom: number;
  planTarget: number;
  planDue: string;
  actions: ActionItem[];
  reasoningGaps: ReasoningGap[];
}

const RELIANCE: AccountSummary = {
  id: 'reliance-digital',
  name: 'Reliance Digital',
  nps: 8.6,
  accountType: 'Standard account',
  care: 'Hypercare',
  renewal: 'Renewal on, July 15',
  pillars: [
    { label: 'Adoption', status: 'green' }, { label: 'Impact', status: 'green' },
    { label: 'Performance', status: 'green' }, { label: 'Service', status: 'green' },
    { label: 'Projects', status: 'green' }, { label: 'Stakeholder', status: 'green' },
  ],
  healthScore: 0.65,
  weightedTarget: 0.86,
  narrative:
    'Currently sitting at a Health score of 0.65 against its weighted target of 0.86, this account is operating under significant deficit and faces severe churn risk. The majority of this performance gap is driven directly by underlying performance dimensions, with the Commercial and Adoption metrics jointly responsible for over half of the total shortfall.',
  overallState:
    'This account is Red overall (0.65), driven almost entirely by a sharp, unexplained Adoption drop in the North region. Commercial is soft on collections. Stakeholder and product quality remain strong. Understanding why adoption fell is the priority before planning.',
  dimensions: [
    {
      key: 'commercial', label: 'Commercial', score: 0.62, target: 0.9, status: 'red',
      issue: 'Main issue is weak collection performance with 3 overdue invoices.',
      flagged: 'At Risk',
      narrative: 'The Commercial dimension is currently flagged as At Risk, scoring 0.62 against a targeted threshold of 0.90 (a 0.28 deficit). Because this category represents one of the single largest drivers of overall account instability, addressing it is critical to preventing account churn before renewal.',
      breakdown: [
        { label: 'Primary Driver', text: 'The score is heavily dragged down by weak collection performance, indicating persistent issues with payment timing, overdue invoices, outstanding balances, or billing friction.' },
        { label: 'Account Risk', text: 'Combined with low product adoption, this financial lag creates a high risk profile, signalling potential budget constraints, dissatisfaction, or invoice disputes on the client’s end.' },
      ],
      recommended: [
        { label: 'Audit Financials', text: 'Work with finance/billing teams to review outstanding invoices, payment history, and payment dispute logs.' },
        { label: 'Engage Stakeholders', text: 'Schedule a commercial check-in with the client’s procurement or finance lead to resolve outstanding balances and align on payment schedules.' },
        { label: 'Review Contract Terms', text: 'Evaluate if flexible payment terms or restructured contract milestones are needed to secure the upcoming renewal.' },
      ],
    },
    {
      key: 'adoption', label: 'Adoption', score: 0.58, target: 0.85, status: 'red',
      issue: 'Main issue is a sharp, unexplained drop in usage in the North region.',
      flagged: 'At Risk',
      narrative: 'Adoption is flagged as At Risk, scoring 0.58 against a 0.85 target (a 0.27 deficit). A sharp, unexplained fall in weekly active usage concentrated in the North region is the single largest contributor to the account’s overall instability.',
      breakdown: [
        { label: 'Primary Driver', text: 'Weekly active usage in the North region fell ~31% month-over-month with no corresponding rise in support tickets — pointing to a behavioural rather than a defect cause.' },
        { label: 'Account Risk', text: 'Sustained under-utilisation erodes realised value ahead of renewal and typically precedes downgrade or churn conversations.' },
      ],
      recommended: [
        { label: 'Diagnose First', text: 'Run a usage-driver analysis to isolate whether the cause is a champion change, a process change, or a seasonal slowdown.' },
        { label: 'Re-enable the Team', text: 'If a champion moved on, deliver a targeted refresher enablement to the North-region users.' },
        { label: 'Track Recovery', text: 'Set a weekly active-usage watch on the North region until it returns to trend.' },
      ],
    },
    {
      key: 'operations', label: 'Operations', score: 0.66, target: 0.88, status: 'red',
      issue: 'Main issue is P2 SLA breaches, currently escalated to core engineering & infrastructure.',
      flagged: 'At Risk',
      narrative: 'Operations scores 0.66 against a 0.88 target (a 0.22 deficit). Repeated P2 SLA breaches have been escalated to core engineering and infrastructure and are dragging service perception.',
      breakdown: [
        { label: 'Primary Driver', text: 'A cluster of P2 incidents breached SLA and required escalation beyond front-line support.' },
        { label: 'Account Risk', text: 'Aged escalations undermine trust with technical stakeholders even while executive sentiment stays positive.' },
      ],
      recommended: [
        { label: 'Escalation Review', text: 'Run a joint review with engineering on the open P2 breaches and commit to remediation dates.' },
        { label: 'Proactive Comms', text: 'Give the client a written incident summary and prevention plan.' },
      ],
    },
    {
      key: 'context', label: 'Customer Context', score: 0.6, target: 0.8, status: 'red',
      issue: 'Main issue is an ongoing client-side budget review threatening renewal.',
      flagged: 'At Risk',
      narrative: 'Customer Context scores 0.60 against a 0.80 target (a 0.20 deficit). An ongoing client-side budget review, alongside competitor activity in an adjacent business unit, is threatening the renewal.',
      breakdown: [
        { label: 'Primary Driver', text: 'A budget review at the client could compress or delay the renewal envelope.' },
        { label: 'Account Risk', text: 'A pending reorg may shift our sponsor’s remit and open the door to a competitor.' },
      ],
      recommended: [
        { label: 'Confirm Sponsor Remit', text: 'Executive check-in to confirm the sponsor’s remit survives the reorg.' },
        { label: 'Build the Business Case', text: 'Prepare a value/ROI summary the sponsor can carry into the budget review.' },
      ],
    },
    {
      key: 'impact', label: 'Business Impact', score: 0.71, target: 0.8, status: 'yellow',
      issue: 'Main issue is ROI reporting pending client data for quarterly review.',
      flagged: 'Watch',
      narrative: 'Business Impact scores 0.71 against a 0.80 target (a 0.09 deficit). Realised value is solid where the product is adopted, but ROI reporting is stalled pending client data for the quarterly review.',
      breakdown: [
        { label: 'Primary Driver', text: 'The quarterly ROI report is blocked on client-side data inputs.' },
        { label: 'Account Risk', text: 'Without a fresh ROI narrative, the value story going into renewal is weaker than it should be.' },
      ],
      recommended: [
        { label: 'Unblock the Data', text: 'Chase the client owner for the outstanding data set and offer to co-build the report.' },
      ],
    },
    {
      key: 'quality', label: 'Product Quality', score: 0.74, target: 0.82, status: 'yellow',
      issue: 'Defect rate remains stable with 2 open bugs on integration.',
      flagged: 'Watch',
      narrative: 'Product Quality scores 0.74 against a 0.82 target (a 0.08 deficit). Defect rate is stable with two open integration bugs — a watch item rather than a driver of instability.',
      breakdown: [
        { label: 'Primary Driver', text: 'Two open integration bugs remain, though the overall defect rate is stable.' },
        { label: 'Account Risk', text: 'Low — contained, but worth closing before renewal to keep the technical relationship clean.' },
      ],
      recommended: [
        { label: 'Close the Bugs', text: 'Prioritise the two open integration bugs in the next sprint and confirm fixes with the client.' },
      ],
    },
    {
      key: 'stakeholder', label: 'Stakeholder Relationship', score: 0.91, target: 0.85, status: 'green',
      issue: 'Executive sponsor is actively engaged with a regular monthly cadence.',
      flagged: 'Healthy',
      narrative: 'Stakeholder Relationship scores 0.91 against a 0.85 target (a +0.06 surplus). The executive sponsor is actively engaged on a regular monthly cadence — a genuine strength to leverage.',
      breakdown: [
        { label: 'Strength', text: 'Strong executive sponsorship following the October business review.' },
        { label: 'Leverage', text: 'Use the sponsor relationship to unblock the budget review and the ROI data.' },
      ],
      recommended: [
        { label: 'Maintain Cadence', text: 'Keep the monthly executive cadence and bring the recovery plan to the next session.' },
      ],
    },
  ],
  planFrom: 0.65,
  planTarget: 0.77,
  planDue: 'Sep 30, 2026',
  actions: [
    { id: 'a1', action: 'Run a usage-driver analysis for the North region', rationale: 'Pinpoints whether the drop is a people, process or seasonal cause before we intervene — the biggest gap on the account.', dimension: 'Adoption', impact: 0.18, date: '20 Aug 2026', assignee: 'Ananya Mehta' },
    { id: 'a2', action: 'Re-onboard the North-region team with a refresher enablement', rationale: 'If a champion changed roles, a targeted refresher restores active usage fastest.', dimension: 'Adoption', impact: 0.14, date: '05 Sep 2026', assignee: 'Ritu Sharma' },
    { id: 'a3', action: 'Resolve the 3 overdue invoices with AP & finance', rationale: 'Clears the collections drag on commercial health and removes a renewal risk.', dimension: 'Commercial', impact: 0.16, date: '15 Aug 2026', assignee: 'Richa Pandey' },
    { id: 'a4', action: 'Run an escalation review on the P2 SLA breaches', rationale: 'Commits engineering to remediation dates and rebuilds technical trust.', dimension: 'Operations', impact: 0.12, date: '22 Aug 2026', assignee: 'Mohit Kapoor' },
    { id: 'a5', action: 'Executive check-in on the client-side budget review', rationale: 'Protects the strong stakeholder position against the pending reorg and budget review.', dimension: 'Customer Context', impact: 0.1, date: '28 Aug 2026', assignee: 'Ananya Mehta' },
  ],
  reasoningGaps: [
    { id: 'g1', dimensionKey: 'adoption', question: 'What’s behind the North-region adoption drop? Any of these?', suggestions: ['Key champion changed roles', 'Their internal process changed', 'Holiday / seasonal slowdown'] },
    { id: 'g2', dimensionKey: 'context', question: 'Is the client-side budget review likely to block renewal, or is it routine?', suggestions: ['Serious — renewal at risk', 'Routine annual review', 'Need to confirm with sponsor'] },
  ],
};

const ACCOUNTS: Record<string, AccountSummary> = {
  'reliance-digital': RELIANCE,
};

export function getAccountSummary(id: string): AccountSummary | undefined {
  return ACCOUNTS[id];
}

export function gapFor(d: SummaryDimension): number {
  return Math.round((d.score - d.target) * 100) / 100;
}
