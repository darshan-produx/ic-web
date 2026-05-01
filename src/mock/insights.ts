export const mockInsights = [
  {
    _id: 'ins_001',
    title: 'Meesho payment success rate dropped 4% in last 30 days',
    type: 'Risk',
    category: 'Product Health',
    status: 'Open',
    priority: 'High',
    customer_id: 102,
    customer_name: 'Meesho',
    description: 'Payment success rate has fallen from 95.5% to 91.5% over the last 30 days. Primary failures are on UPI auto-debit flows.',
    recommended_action: 'Schedule a technical call with Meesho engineering team to review UPI auto-debit integration config.',
    created_at: '2025-04-10T09:00:00Z',
    updated_at: '2025-04-18T09:00:00Z',
    assigned_to_id: 1,
    assigned_to_name: 'Priya Nair',
    source: 'Automated Detection',
  },
  {
    _id: 'ins_002',
    title: 'CRED renewal coming up in 4 months — no commercial conversation initiated',
    type: 'Risk',
    category: 'Renewal',
    status: 'Open',
    priority: 'High',
    customer_id: 104,
    customer_name: 'CRED',
    description: 'CRED\'s contract expires on Aug 31, 2025. No renewal discussion has started. Competitor PineLabs has been in conversations with their payments team.',
    recommended_action: 'Initiate renewal conversation in next 2 weeks. Prepare ROI summary showing YoY payment volume growth.',
    created_at: '2025-04-08T09:00:00Z',
    updated_at: '2025-04-08T09:00:00Z',
    assigned_to_id: 2,
    assigned_to_name: 'Arjun Mehta',
    source: 'Manual',
  },
  {
    _id: 'ins_003',
    title: 'Zerodha — Opportunity to upsell RazorpayX Treasury',
    type: 'Opportunity',
    category: 'Upsell',
    status: 'Open',
    priority: 'Medium',
    customer_id: 106,
    customer_name: 'Zerodha',
    description: 'Zerodha currently manages ~₹800Cr in idle float across multiple bank accounts. RazorpayX Treasury can offer better yield and unified visibility.',
    recommended_action: 'Introduce RazorpayX Treasury in next EBR. Involve product specialist for demo.',
    created_at: '2025-03-25T09:00:00Z',
    updated_at: '2025-04-01T09:00:00Z',
    assigned_to_id: 3,
    assigned_to_name: 'Sneha Kulkarni',
    source: 'Manual',
  },
  {
    _id: 'ins_004',
    title: 'Pharmeasy NPS dropped to 38 — 3 detractors in last survey',
    type: 'Risk',
    category: 'Customer Sentiment',
    status: 'In Progress',
    priority: 'Urgent',
    customer_id: 107,
    customer_name: 'Pharmeasy',
    description: 'Latest NPS survey returned score of 38. 3 out of 8 respondents are detractors citing poor API documentation and slow support response times.',
    recommended_action: 'Executive escalation call within this week. Assign dedicated support engineer for 30 days.',
    created_at: '2025-04-12T09:00:00Z',
    updated_at: '2025-04-19T09:00:00Z',
    assigned_to_id: 1,
    assigned_to_name: 'Priya Nair',
    source: 'NPS Survey',
  },
  {
    _id: 'ins_005',
    title: 'Nykaa expanding to Loyalty Subscriptions — high upsell potential',
    type: 'Opportunity',
    category: 'Expansion',
    status: 'Closed Won',
    priority: 'Medium',
    customer_id: 103,
    customer_name: 'Nykaa',
    description: 'Nykaa is launching a beauty box subscription program in Q2 2025. They are evaluating Razorpay Subscriptions for billing.',
    recommended_action: 'Demo completed. Contract amendment sent for Subscriptions add-on.',
    created_at: '2025-03-10T09:00:00Z',
    updated_at: '2025-04-10T09:00:00Z',
    assigned_to_id: 2,
    assigned_to_name: 'Arjun Mehta',
    source: 'Manual',
  },
  {
    _id: 'ins_006',
    title: 'Swiggy — Payment volume grew 28% MoM, at capacity threshold',
    type: 'Opportunity',
    category: 'Product Health',
    status: 'Open',
    priority: 'Medium',
    customer_id: 101,
    customer_name: 'Swiggy',
    description: 'Swiggy\'s monthly payment volume crossed ₹320Cr, nearing the current rate limit tier. Proactive upgrade recommended.',
    recommended_action: 'Contact Swiggy\'s payments team to upgrade rate limits before they hit throttling. Also propose Route for smart routing to improve success rate further.',
    created_at: '2025-04-05T09:00:00Z',
    updated_at: '2025-04-05T09:00:00Z',
    assigned_to_id: 1,
    assigned_to_name: 'Priya Nair',
    source: 'Automated Detection',
  },
];

export const getInsightsByCustomer = (customer_id: number) =>
  mockInsights.filter((i) => i.customer_id === customer_id);

// ─── Opportunities mock data ───────────────────────────────────────────────

export const mockOpportunities = [
  // Identified
  { _id: 'opp-001', customer_id: 101, customer_name: 'Zomato Ltd.',         insight_type: 'Expansion',  insight_name: 'RazorpayX',        title: 'Zomato — RazorpayX vendor payout platform rollout',            action_sub_status: 'Identified',  action_status: 'Open',      is_viewed: true,  opportunity_value: 32000000,  target_closure_date: '2026-06-30', created_by: 'usr-004', opportunity_created_by: 'Deepika Sharma', created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-25T11:00:00Z',
    updates: [
      { update_id: 'upd-001-a', description: 'Had intro call with the VP Payments team. They are evaluating RazorpayX for vendor payouts across 1200+ vendors. Positive intent, next step is a demo.', timestamp: '2026-04-22T10:30:00Z', source: 'manual', is_deleted: false, created_by: 'usr-004', created_by_name: 'Deepika Sharma' },
      { update_id: 'upd-001-b', description: 'Sent product deck and pricing proposal. Following up next week after they review internally.', timestamp: '2026-04-18T14:00:00Z', source: 'manual', is_deleted: false, created_by: 'usr-004', created_by_name: 'Deepika Sharma' },
    ],
  },
  { _id: 'opp-002', customer_id: 102, customer_name: 'BookMyShow',           insight_type: 'Expansion',  insight_name: 'Smart Collect',    title: 'BookMyShow — Smart Collect for B2B promoter payments',         action_sub_status: 'Identified',  action_status: 'Open',      is_viewed: false, opportunity_value: 18000000,  target_closure_date: '2026-07-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-12T10:00:00Z', updated_at: '2026-04-24T09:30:00Z' },
  { _id: 'opp-003', customer_id: 103, customer_name: 'Nykaa',                insight_type: 'Expansion',  insight_name: 'POS Terminals',    title: 'Nykaa — POS terminal rollout to 30 stores',                    action_sub_status: 'Identified',  action_status: 'Open',      is_viewed: true,  opportunity_value: 21000000,  target_closure_date: '2026-06-30', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-15T09:00:00Z', updated_at: '2026-04-23T14:00:00Z' },
  { _id: 'opp-004', customer_id: 104, customer_name: 'Ola Cabs',             insight_type: 'Expansion',  insight_name: 'Route',            title: 'Ola — Route payout for driver incentives',                     action_sub_status: 'Identified',  action_status: 'Open',      is_viewed: false, opportunity_value: 27000000,  target_closure_date: '2026-08-15', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-21T09:00:00Z', updated_at: '2026-04-21T09:00:00Z' },

  // Evaluating
  { _id: 'opp-005', customer_id: 105, customer_name: 'Dream11',              insight_type: 'Expansion',  insight_name: 'RazorpayX',        title: 'Dream11 — RazorpayX multi-use case expansion',                 action_sub_status: 'Evaluating',  action_status: 'Open',      is_viewed: true,  opportunity_value: 24000000,  target_closure_date: '2026-07-15', created_by: 'usr-006', opportunity_created_by: 'Arjun Mehta',    created_at: '2026-04-15T10:00:00Z', updated_at: '2026-04-26T08:00:00Z' },
  { _id: 'opp-006', customer_id: 106, customer_name: 'Urban Company',        insight_type: 'Expansion',  insight_name: 'Route',            title: 'Urban Company — Route for international CSP payouts',          action_sub_status: 'Evaluating',  action_status: 'Open',      is_viewed: true,  opportunity_value: 16000000,  target_closure_date: '2026-08-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-16T10:00:00Z', updated_at: '2026-04-25T13:00:00Z' },
  { _id: 'opp-007', customer_id: 107, customer_name: 'Swiggy',               insight_type: 'Expansion',  insight_name: 'Magic Checkout',   title: 'Swiggy — Magic Checkout adoption for Instamart',               action_sub_status: 'Evaluating',  action_status: 'Open',      is_viewed: false, opportunity_value: 31000000,  target_closure_date: '2026-07-31', created_by: 'usr-004', opportunity_created_by: 'Deepika Sharma', created_at: '2026-04-20T11:00:00Z', updated_at: '2026-04-26T10:00:00Z' },
  { _id: 'opp-008', customer_id: 108, customer_name: 'CRED',                 insight_type: 'Expansion',  insight_name: 'Smart Collect',    title: 'CRED — Smart Collect for member cashback disbursements',        action_sub_status: 'Evaluating',  action_status: 'Open',      is_viewed: false, opportunity_value: 14500000,  target_closure_date: '2026-08-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-22T09:30:00Z', updated_at: '2026-04-25T15:00:00Z' },

  // Proposed
  { _id: 'opp-009', customer_id: 109, customer_name: 'PhysicsWallah (PW)',   insight_type: 'Expansion',  insight_name: 'Intl. Payments',   title: 'PhysicsWallah — international payments for MENA',              action_sub_status: 'Proposed',    action_status: 'Open',      is_viewed: true,  opportunity_value: 42000000,  target_closure_date: '2026-06-30', created_by: 'usr-007', opportunity_created_by: 'Priya Nair',     created_at: '2026-04-17T10:00:00Z', updated_at: '2026-04-26T09:00:00Z' },
  { _id: 'opp-010', customer_id: 110, customer_name: 'Zepto',                insight_type: 'Expansion',  insight_name: 'Route',            title: 'Zepto — Route for dark store payouts',                         action_sub_status: 'Proposed',    action_status: 'Open',      is_viewed: true,  opportunity_value: 38000000,  target_closure_date: '2026-06-30', created_by: 'usr-004', opportunity_created_by: 'Deepika Sharma', created_at: '2026-04-14T10:00:00Z', updated_at: '2026-04-25T17:00:00Z' },
  { _id: 'opp-011', customer_id: 111, customer_name: 'Meesho',               insight_type: 'Expansion',  insight_name: 'RazorpayX',        title: 'Meesho — RazorpayX for seller payout automation',              action_sub_status: 'Proposed',    action_status: 'Open',      is_viewed: false, opportunity_value: 19000000,  target_closure_date: '2026-07-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-18T11:00:00Z', updated_at: '2026-04-24T12:00:00Z' },
  { _id: 'opp-012', customer_id: 112, customer_name: 'MediBuddy',            insight_type: 'Expansion',  insight_name: 'Subscriptions',    title: 'MediBuddy — subscription mandate for health plan renewals',     action_sub_status: 'Proposed',    action_status: 'Open',      is_viewed: true,  opportunity_value: 11500000,  target_closure_date: '2026-08-15', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-21T10:00:00Z', updated_at: '2026-04-25T08:30:00Z' },

  // Negotiating
  { _id: 'opp-013', customer_id: 113, customer_name: 'Mamaearth',            insight_type: 'Expansion',  insight_name: 'RazorpayX',        title: 'Mamaearth — RazorpayX for vendor disbursements',               action_sub_status: 'Negotiating', action_status: 'Open',      is_viewed: true,  opportunity_value: 9500000,   target_closure_date: '2026-08-31', created_by: 'usr-007', opportunity_created_by: 'Priya Nair',     created_at: '2026-04-18T10:00:00Z', updated_at: '2026-04-26T11:00:00Z' },
  { _id: 'opp-014', customer_id: 114, customer_name: 'BigBasket',            insight_type: 'Renewal',    insight_name: 'Payment Gateway',  title: 'BigBasket — gateway renewal with upsell to Smart Collect',     action_sub_status: 'Negotiating', action_status: 'Open',      is_viewed: true,  opportunity_value: 55000000,  target_closure_date: '2026-05-31', created_by: 'usr-005', opportunity_created_by: 'Riya Shah',      created_at: '2026-04-10T08:00:00Z', updated_at: '2026-04-27T09:00:00Z' },
  { _id: 'opp-015', customer_id: 115, customer_name: 'Lenskart',             insight_type: 'Upsell',     insight_name: 'Magic Checkout',   title: 'Lenskart — Magic Checkout for offline-to-online flow',         action_sub_status: 'Negotiating', action_status: 'Open',      is_viewed: false, opportunity_value: 8500000,   target_closure_date: '2026-07-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-19T10:00:00Z', updated_at: '2026-04-22T16:00:00Z' },

  // Churn Risk
  { _id: 'opp-016', customer_id: 116, customer_name: 'MakeMyTrip',           insight_type: 'Churn Risk', insight_name: 'Intl. Payments',   title: 'MakeMyTrip — international payment churn risk',                action_sub_status: 'Churn Risk',  action_status: 'Open',      is_viewed: true,  opportunity_value: 310000000, target_closure_date: '2026-06-30', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-18T09:00:00Z', updated_at: '2026-04-26T16:00:00Z' },
  { _id: 'opp-017', customer_id: 117, customer_name: 'Policybazaar',         insight_type: 'Churn Risk', insight_name: 'Mandate',          title: 'Policybazaar — renewal at risk (mandate failure + BillDesk)',  action_sub_status: 'Churn Risk',  action_status: 'Open',      is_viewed: false, opportunity_value: 165000000, target_closure_date: '2026-07-31', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-20T09:00:00Z', updated_at: '2026-04-27T07:30:00Z' },
  { _id: 'opp-018', customer_id: 118, customer_name: 'Unacademy',            insight_type: 'Churn Risk', insight_name: 'Payment Gateway',  title: 'Unacademy — contract reduction or churn risk',                 action_sub_status: 'Churn Risk',  action_status: 'Open',      is_viewed: true,  opportunity_value: 72000000,  target_closure_date: '2026-06-30', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-25T10:00:00Z' },
  { _id: 'opp-019', customer_id: 119, customer_name: 'ShareChat',            insight_type: 'Churn Risk', insight_name: 'Payment Gateway',  title: 'ShareChat — at risk due to competitor pricing pressure',        action_sub_status: 'Churn Risk',  action_status: 'Open',      is_viewed: false, opportunity_value: 48000000,  target_closure_date: '2026-06-15', created_by: null,       opportunity_created_by: null,             created_at: '2026-04-22T10:00:00Z', updated_at: '2026-04-26T12:00:00Z' },

  // Closed Won
  { _id: 'opp-020', customer_id: 101, customer_name: 'Zomato Ltd.',          insight_type: 'Expansion',  insight_name: 'Subscriptions',    title: 'Zomato — Zomato Pro subscription mandate rollout',             action_sub_status: 'Closed Won',  action_status: 'Completed', is_viewed: true,  opportunity_value: 22000000,  target_closure_date: '2026-04-15', created_by: 'usr-004', opportunity_created_by: 'Deepika Sharma', created_at: '2026-03-01T09:00:00Z', updated_at: '2026-04-15T16:00:00Z' },
  { _id: 'opp-021', customer_id: 105, customer_name: 'Dream11',              insight_type: 'Upsell',     insight_name: 'Smart Collect',    title: 'Dream11 — Smart Collect for fantasy winnings payout',          action_sub_status: 'Closed Won',  action_status: 'Completed', is_viewed: true,  opportunity_value: 17500000,  target_closure_date: '2026-04-10', created_by: 'usr-006', opportunity_created_by: 'Arjun Mehta',    created_at: '2026-02-20T10:00:00Z', updated_at: '2026-04-10T14:00:00Z' },

  // Closed Lost
  { _id: 'opp-022', customer_id: 120, customer_name: "Byju's",               insight_type: 'Renewal',    insight_name: 'Payment Gateway',  title: "Byju's — renewal lost due to insolvency proceedings",          action_sub_status: 'Closed Lost', action_status: 'Ignored',   is_viewed: true,  opportunity_value: 90000000,  target_closure_date: '2026-04-01', created_by: 'usr-005', opportunity_created_by: 'Riya Shah',      created_at: '2026-02-15T09:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
];
