import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { getAllActiveInsights } from '../../../../../app/api/insights/insights';
import ListAllActiveInsights from '../listAllActiveInsights';
import CreateOpportunityModal from '../../../../../app/app/insights/opportunities/components/createOpportunityModal';
import OpportunityDetailsSideBarView from '../../../../../app/app/insights/opportunities/opportunityDetailsSideBarView';

export default function Opportunity360({ id }: any) {
  const [createOpportunityModal, setCreateOpportunityModal] = useState(false);
  const [opportunitiesSidebarViewOpen, setOpportunitiesSidebarViewOpen] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');

  const { data: allActiveInsights } = useQuery({
    queryKey: ['getAllActiveInsights'],
    queryFn: () => getAllActiveInsights(Number(id)),
  });
  const opportunityInsights = allActiveInsights?.data?.data?.filter(
    (insight: any) => insight?.insight_type === 'Opportunity'
  );

  const itemDetailView = (id: string) => {
    setOpportunitiesSidebarViewOpen(true);
    setSelectedOpportunityId(id);
  };

  return (
    <div className="mt-[20px]">
      <div className="w-[1200px] mx-auto">
        {' '}
        <span className="pt-[2px] text-[14px] text-[#3B82F6] cursor-pointer" onClick={() => setCreateOpportunityModal(true)}>
          <span className="text-[18px]">+</span> &nbsp;Create new
        </span>
      </div>
      {opportunityInsights?.length > 0 ? (
        <div onClick={(e) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest('a[href*="/app/insights?selected="]');
          if (anchor) {
            e.preventDefault();
            const href = anchor.getAttribute('href');
            const match = href?.match(/selected=([^&]+)/);
            if (match) {
              itemDetailView(match[1]);
            }
          }
        }}>
          <ListAllActiveInsights allActiveInsights={opportunityInsights} />
        </div>
      ) : (
        <div className="mt-[2px] w-[1200px] mx-auto h-[456px] text-center pt-[146px] gap-[10px] rounded-[12px] border border-[#E4E7EC] overflow-y-auto">
          No opportunities
        </div>
      )}
      {!!createOpportunityModal && (
        <CreateOpportunityModal
          createOpportunityModal={createOpportunityModal}
          setCreateOpportunityModal={setCreateOpportunityModal}
          customerId={Number(id)}
        />
      )}
      <OpportunityDetailsSideBarView
        isOpen={opportunitiesSidebarViewOpen}
        onClose={() => setOpportunitiesSidebarViewOpen(false)}
        selectedOpportunityId={selectedOpportunityId}
      />
    </div>
  );
}
