import { useQuery } from '@tanstack/react-query';
import { getAllActiveInsights } from '../../../../../app/api/insights/insights';
import ListAllActiveInsights from '../listAllActiveInsights';

export default function Risk360({ id }: any) {
  const { data: allActiveInsights } = useQuery({
    queryKey: ['getAllActiveInsights'],
    queryFn: () => getAllActiveInsights(Number(id)),
  });
  const riskInsights = allActiveInsights?.data?.data?.filter(
    (insight: any) => insight?.insight_type === 'Risk'
  );
  return (
    <div className="mt-[20px]">
      {riskInsights?.length > 0 ? (
        <ListAllActiveInsights allActiveInsights={riskInsights} />
      ) : (
        <div className="w-[1200px] mx-auto h-[456px] text-center pt-[146px] gap-[10px] rounded-[12px] border border-[#E4E7EC] overflow-y-auto">
          No risks
        </div>
      )}
    </div>
  );
}
