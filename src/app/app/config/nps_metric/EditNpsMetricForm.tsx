import React from 'react';
import TargetThresholdForm from './TargetThresholdForm';
import { useEditNpsMetric } from '../../../services/mutations/configMutations';

const EditPage: React.FC<{ setEditModal: any; editData: any }> = ({
  setEditModal,
  editData,
}) => {
  const { mutate } = useEditNpsMetric();
  const handleEditSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto">
      <TargetThresholdForm
        onSubmit={handleEditSubmit}
        setEditModal={setEditModal}
        editData={editData}
      />
    </div>
  );
};

export default EditPage;
