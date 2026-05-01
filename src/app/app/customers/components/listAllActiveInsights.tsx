import React, { useState } from 'react';
import TimeSeriesInsightCard from '../../insights/timeSeriesInsightCard';
import UnstructuredInsightCard from '../../insights/unstructuredInsightCard';
import TaskInsightCard from '../../insights/taskInsightCard';

function ListAllActiveInsights(props: any) {
  const { allActiveInsights } = props;
  const [selectedInsightCardId, setSelectedInsightCardId] = useState(
    allActiveInsights[0]?._id
  );
  const handleCardSelection = async (id: any) => {
    setSelectedInsightCardId(id);
  };
  return (
    <div className="rounded-[12px] border-[#E4E7EC] overflow-hidden min-h-[calc(100vh-12.9rem)] pb-[22px]  pt-[24px]">
      <div className="w-[1200px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        {allActiveInsights?.map((insight: any, index: number) => {
          switch (insight?.insight_type) {
            case 'Risk':
              return (
                <div className="border rounded-xl p-2 border-[#E4E7EC] overflow-hidden">
                  <div key={index} className="pl-[18px]">
                    <a
                      // href={`/app/insights/${insight._id}`}
                      href={`/app/insights?selected=${insight._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <TimeSeriesInsightCard
                        insight={insight}
                        handleCardSelection={handleCardSelection}
                        isDetail={true}
                        customer360={true}
                      />
                    </a>
                  </div>
                </div>
              );
            // case 'task':
            //   return (
            //     <div className="border rounded-xl p-2  border-[#E4E7EC] overflow-hidden">
            //       <div key={index} className="pl-[18px]">
            //         <a
            //           href={`/app/insights?selected=${insight._id}`}
            //           target="_blank"
            //           rel="noopener noreferrer"
            //           className="block"
            //         >
            //           <TaskInsightCard
            //             insight={insight}
            //             handleCardSelection={handleCardSelection}
            //             isDetail={true}
            //             customer360={true}
            //           />
            //         </a>
            //       </div>
            //     </div>
            //   );
            case 'Opportunity':
              return (
                <div className="border border-[#E4E7EC] p-2 rounded-xl overflow-hidden">
                  <div key={index} className=" pl-[18px]">
                    <a
                      // href={`/app/insights/${insight._id}`}
                      href={`/app/insights?selected=${insight._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <UnstructuredInsightCard
                        insight={insight}
                        handleCardSelection={handleCardSelection}
                        isDetail={true}
                        customer360={true}
                      />
                    </a>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

export default ListAllActiveInsights;
