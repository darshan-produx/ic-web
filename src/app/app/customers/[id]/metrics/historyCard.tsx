import { useEffect, useState } from 'react';

const History: React.FC<any> = ({ history }) => {
  const [target, setTarget] = useState<{
    field: string;
    old: number | null;
    new: number | null;
  }>({ field: '', old: null, new: null });
  const [threshold, setThreshold] = useState<{
    field: string;
    old: number | null;
    new: number | null;
  }>({ field: '', old: null, new: null });
  const [statusFlag, setStatusFlag] = useState<{
    field: string;
    old: boolean | null;
    new: boolean | null;
  }>({ field: '', old: null, new: null });
  const [insightFlag, setInsightFlag] = useState<{
    field: string;
    old: boolean | null;
    new: boolean | null;
  }>({ field: '', old: null, new: null });
  const [comment, setComment] = useState<string>('');
  const [updatedBy, setUpdatedBy] = useState<string>('');
  useEffect(() => {
    if (history) {
      history?.changes?.map((ele: any) => {
        if (ele?.field == 'target') {
          setTarget(ele);
        }
        if (ele?.field == 'threshold') {
          setThreshold(ele);
        }
        if (ele?.field == 'status_flag') {
          setStatusFlag(ele);
        }
        if (ele?.field == 'insight_flag') {
          setInsightFlag(ele);
        }
      });
      setComment(history?.comment ? history?.comment : '');
      setUpdatedBy(
        history?.updated_by
          ? history?.updated_by?.first_name +
              ' ' +
              history?.updated_by?.last_name
          : ''
      );
    }
  }, [history]);

  return Object.keys(history).length > 0 ? (
    <div className="flex flex-col p-3">
      {target || threshold || statusFlag || insightFlag ? (
        <div className="flex flex-col gap-1 text-[14px] font-medium leading-5 text-[#202B37] border-b-[1px] pb-3 border-[#F2F4F7]">
          {' '}
          {target && target?.field === 'target' && (
            <div>
              {`Target changed from ${target?.old ?? 0} to ${target?.new ?? 0}`}
            </div>
          )}
          {threshold && threshold?.field === 'threshold' && (
            <div>
              {`Threshold changed from ${threshold?.old ?? 0} to ${
                threshold?.new ?? 0
              }`}
            </div>
          )}
          {statusFlag && statusFlag?.field === 'status_flag' && (
            <div>{`Track status turned ${statusFlag?.new ? 'On' : 'Off'}`}</div>
          )}
          {insightFlag && insightFlag?.field === 'insight_flag' && (
            <div>
              {`Track insights turned ${insightFlag?.new ? 'On' : 'Off'}`}
            </div>
          )}
        </div>
      ) : null}
      {comment || updatedBy ? (
        <div className="flex flex-col gap-1 text-[14px] font-normal leading-4 text-[#202B37] pt-3">
          {comment && <div>{`Note: ${comment}`}</div>}
          {updatedBy && <div>{`Updated by: ${updatedBy}`}</div>}
        </div>
      ) : null}
    </div>
  ) : (
    <div className="text-[14px] font-medium leading-5 text-[#202B37]">
      {' '}
      No history
    </div>
  );
};

export default History;
