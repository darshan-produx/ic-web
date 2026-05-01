'use client';
import { useQuery } from '@tanstack/react-query';
import MeetingDetails from '../components/meetingDetails';
import { apiRequest } from '../../../../../common/api-request';
import { useParams } from 'next/navigation';
import { getAllMyTeamCustomers } from '../../../../../app/api/communication/communication';
import { useState } from 'react';
import UploadTranscriptModal from '../components/uploadTranscriptModal';
import Loading from '../../../../../common/components/loading';

export default function MeetingPage() {
  const [confirmWith, setConfirmWith] = useState(false);
  const [uploadTransriptModalOpen, setUploadTransriptModalOpen] = useState({
    meeting: {},
    status: false,
    isEdit: false,
  });
  const { meeting_id } = useParams();
  const { data: meetingSuggestion, isLoading } = useQuery({
    queryKey: ['meetingSuggetions', meeting_id],

    queryFn: () =>
      apiRequest({
        url: `/api/app-service/v1/customer-meeting/${meeting_id}`,
      }),
  });

  const { data: allCustomers } = useQuery({
    queryKey: ['allMyTeamCustomers'],
    queryFn: () => getAllMyTeamCustomers(),
  });

  return isLoading ? (
    <Loading />
  ) : (
    <div className="pb-4">
      <MeetingDetails
        meetingDetails={meetingSuggestion?.data?.meetingDetails}
        // allCustomers={allCustomers}
        confirmWith={confirmWith}
        setConfirmWith={setConfirmWith}
        setUploadTransriptModalOpen={setUploadTransriptModalOpen}
      />
      {uploadTransriptModalOpen?.status && (
        <UploadTranscriptModal
          uploadTransriptModalOpen={uploadTransriptModalOpen}
          setUploadTransriptModalOpen={setUploadTransriptModalOpen}
          allCustomers={allCustomers?.data}
        />
      )}
    </div>
  );
}
