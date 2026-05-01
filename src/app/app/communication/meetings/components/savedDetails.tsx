// import { useQuery } from '@tanstack/react-query';
// import TaskCardGuidance from '../../../insights/taskCardGuidance';
import TaskInsightCard from '../../../insights/taskInsightCard';
import TimeSeriesInsightCard from '../../../insights/timeSeriesInsightCard';
import UnstructuredInsightCrad from '../../../insights/unstructuredInsightCard';
// import { getUsers } from '../../../app/api/users/users';
// import { getAllTasksStatus } from '../../../app/api/tasks/tasks';
import TaskCard from '../../../tasks/taskCard';

export default function SavedDetails({ data }: any) {
  // const { data: existingUsers } = useQuery({
  //   queryKey: ['users'],
  //   queryFn: getUsers,
  // });

  // const { data: statusArr } = useQuery({
  //   queryKey: ['statusArr'],
  //   queryFn: () => getAllTasksStatus(),
  // });
  return (
    <div>
      {(data?.insightData?.length > 0 || data?.taskData?.length > 0) && (
        <div className="flex gap-[12px]">
          <div className="w-[50%]">
            <div className="text-[14px] text-[#202B37] px-[24px] py-[8px]">
              Risk and opportunities
            </div>
            <div>
              {data?.insightData.map((insight: any) =>
                insight.insight_data_type === 'data' ? (
                  <div
                    key={insight._id}
                    className="py-[12px] pr-0.5 "
                    id={`insight-card-${insight._id}`}
                  >
                    <a
                      href={`/app/insights?selected=${insight._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TimeSeriesInsightCard
                        insight={insight?.insight_data}
                        selectedInsightCardId={''}
                        handleCardSelection={() => {}}
                      />
                    </a>
                  </div>
                ) : insight.insight_data_type === 'task' ? (
                  <div
                    key={insight._id}
                    className="py-[12px] pr-0.5 "
                    id={`insight-card-${insight._id}`}
                  >
                    <a
                      href={`/app/insights?selected=${insight._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TaskInsightCard
                        insight={insight}
                        selectedInsightCardId={''}
                        handleCardSelection={() => {}}
                      />
                    </a>
                  </div>
                ) : insight?.insight_data_type === 'llm' ? (
                  <div
                    className="py-[12px] px-[24px]"
                    id={`insight-card-${insight._id}`}
                  >
                    <a
                      href={`/app/insights?selected=${insight._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <UnstructuredInsightCrad
                        insight={insight}
                        selectedInsightCardId={''}
                        handleCardSelection={() => {}}
                      />
                    </a>
                  </div>
                ) : null
              )}
            </div>
          </div>
          <div className=" w-[50%]  ">
            <div className="text-[14px]  text-[#202B37] px-[24px] py-[8px]">
              Tasks
            </div>
            <div className="px-[24px]">
              {data?.taskData?.map((task: any) => (
                <TaskCard
                  ele={task}
                  // taskStatus={statusArr?.data?.data}
                  done={task?.is_completed}
                  // existingUsers={existingUsers?.data?.data}
                  isDraggable={false}
                  isCustomerDropDownDisabled={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
