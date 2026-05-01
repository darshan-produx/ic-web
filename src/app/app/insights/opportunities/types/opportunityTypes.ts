// Grid Configuration Types
export interface GridConfiguration {
    id: string;
    label: string;
    path: string;
    group: string;
    group_id: string;
    visible: boolean;
    editable: boolean;
    highlight: boolean;
    width: number | null;
    formatter: string;
    order: number;
    meta: any;
    field_base_collection: string;
    list_options?: Array<{ label: string; value: string }>;
    is_multi_select?: boolean;
    enablesorting?: boolean;
    freeze?: 'left' | 'right' | 'none';
    edit_condition?: any;
    can_empty?: boolean;
    data_type: string;
    actions?: Array<any>;
    options_source?: {
        ref_to_collection: string;
        collection_reference_id: string | null;
        value_field?: string;
        label_fields?: string[];
        extra_fields?: string[];
        base_filter?: any;
        aggregation_pipeline?: any[];
    };
    allow_click_to_open_details_view?: boolean;
    allow_in_side_filter?: boolean;
    allow_in_bulk_edit?: boolean;
    allow_in_single_edit?: boolean;
    allow_in_create_form?: boolean;
    include_missing?: boolean;
}

export interface GridViewConfig {
    _id: string;
    view_name: string;
    entity_type: string;
    view_type: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    version: number;
    is_default: boolean;
    sharing: {
        scope: string;
        allowed_roles: string[];
        allowed_users: string[];
    };
    org_id: string;
    configuration: GridConfiguration[];
}

// Opportunity Data Types
export interface OpportunityData {
    _id: string;
    customer_name?: string;
    created_at?: string;
    updated_at?: string;
    title?: string;
    created_by?: string;
    assignee_id?: string;
    opportunity_value?: number;
    action_sub_status?: string;
    target_date?: string;
    product?: string[];
    close_date?: string;
    forecast_category?: string;
    solution_expansion_offering?: string;
    value_proposition?: string;
    economic_buyer?: string;
    champion_influencer?: string;
    procurement_legal_contact?: string;
    need_urgency?: string;
    engagement_level?: string;
    competition?: string;
    next_customer_meeting_date?: string;
    next_customer_meeting_purpose?: string;
    internal_actions_required?: string;
    customer_actions_pending?: string;
    critical_path_to_close?: string;
    biggest_risk?: string;
    data_type?: string;
    mitigation_plan?: string;
    problem_business_need_identified?: string;
    timeline_confirmed?: string;
    if_timeline_not_confirmed_by_when?: string;
    confirmed_decision_process?: string;
    if_decision_process_not_confirmed_details?: string;
    budget_approved?: string;
    if_budget_not_approved_details?: string;
    bant_score?: number;
    manager_notes?: string;
    // Additional properties can be added as needed
    [key: string]: any;
}

// API Response Types
export interface OpportunityGridViewConfigResponse {
    data: {
        data: GridViewConfig[];
    };
}

export interface OpportunitiesDataResponse {
    data: {
        data: OpportunityData[];
        client_currency?: {
            currency: string;
            currencySymbol: string;
        };
    };
}