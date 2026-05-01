export type OnboardingStep =
  | 'login'
  | 'welcome'
  | 'client_details'
  | 'processing'
  | 'agent_results'
  | 'agent_greeting'
  | 'activate'
  | 'complete';

  export interface ClientData {
    clientName: string;
    clientWebsiteUrl: string;
  }

  export interface ProductService {
    name: string;
    description?: string;
  }

  export interface SourceDocument {
    title: string;
    url: string;
    date?: string;
    last_updated?: string;
    snippet?: string;
    source?: string;
  }

  export interface ResearchDetail {
    question: string;
    answer: string;
    confidence: string;
    q_number: string;
  }

  export interface CustomerDetail {
    name: string;
    industry?: string;
    website_url?: string;
    description?: string;
    created_at?: Date;
  }

  export interface clientDetails {
    _id: string;
    client_name: string;
    industry?: string;
    client_website_url: string;
    information?: string;
    products_services?: ProductService[];
    customers?: CustomerDetail[];
    targets_goals?: string;
    source_documents?: SourceDocument[];
    research_details?: ResearchDetail[];
    onboarding_date?: Date;
    status?: string;
    is_analyzed: boolean;
    client_found: boolean;
    business_domain?: string;
  }

  export interface OnboardClientResponse {
    success: boolean;
    client_id?: string;
    data?: clientDetails;
    message?: string;
    error?: string;
  }

  export interface OnboardingCurrentResponse {
    currentStep:
      | 'login'
      | 'welcome'
      | 'client_details'
      | 'processing'
      | 'agent_results'
      | 'agent_greeting'
      | 'activate'
      | 'complete';

    jobId?: string | null;
    clientId?: string | null;
    user?: { name: string; email: string };
  }

