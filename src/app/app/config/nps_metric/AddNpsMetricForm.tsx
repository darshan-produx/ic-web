import React from 'react';
import TargetThresholdForm from './TargetThresholdForm';
import { useAddNpsMetric } from '../../../services/mutations/configMutations';

const AddPage: React.FC<{ setAddModal: any }> = ({ setAddModal }) => {
  const { mutate } = useAddNpsMetric();
  const handleAddSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto">
      <TargetThresholdForm
        onSubmit={handleAddSubmit}
        setAddModal={setAddModal}
      />
    </div>
  );
};

export default AddPage;
