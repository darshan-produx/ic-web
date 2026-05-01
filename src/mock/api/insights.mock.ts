import { mockInsights, mockOpportunities, getInsightsByCustomer } from '../insights';

const res = (data: any) => Promise.resolve({ data: { data, success: true } });

export const getAllInsights = async () => res(mockInsights);

export const getInsightDetails = async (insight_instance_id: string) => {
  const opp = mockOpportunities.find((i) => i._id === insight_instance_id);
  const risk = mockInsights.find((i) => i._id === insight_instance_id);

  // Opportunities always need insight_type='Opportunity' so InsightDeatils
  // renders UnstructuredInsightCard. The display type (Expansion / Churn Risk)
  // is kept in `opportunity_type` for reference.
  const insight = opp
    ? {
        ...opp,
        insight_type: 'Opportunity',
        insight_data_type: 'unstructured',
        opportunity_type: opp.insight_type,
        description: opp.description ?? '',
        research: [],
        researched_at: null,
        is_customer_active: true,
        updates: opp.updates ?? [],
      }
    : risk ?? null;

  return Promise.resolve({
    data: {
      insight_instance: insight,
      guidance: { answer_map: {}, selected_node_id: '' },
    },
  });
};

export const getOpportunities = async () =>
  Promise.resolve({
    data: {
      data: mockOpportunities,
      total: mockOpportunities.length,
      skip: 0,
      client_currency: { currency: 'INR', currency_symbol: '₹' },
    },
  });

export const getOpportunityStatusConfig = async () =>
  Promise.resolve({
    data: {
      value: {
        Pipeline:   ['Identified', 'Evaluating', 'Proposed'],
        Active:     ['Negotiating'],
        'At Risk':  ['Churn Risk'],
        Closed:     ['Closed Won', 'Closed Lost'],
      },
    },
  });

// Write operations
export const createOpportunity = async (data: any) =>
  res({ _id: `ins_${Date.now()}`, ...data, created_at: new Date().toISOString() });

export const updateInsightDetails = async (id: string, data: any) =>
  res({ _id: id, ...data });

export const removeOpportunity = async (id: string) => res({ _id: id, deleted: true });

export const reRunResearch = async (data: any) => res({ success: true });
