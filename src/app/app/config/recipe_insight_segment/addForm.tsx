import React from 'react';
import Form from './form';
import { useAddRecipeInsightSegment } from '../../../services/mutations/configMutations';

const AddPage: React.FC<{ setAddModal: any }> = ({ setAddModal }) => {
  const { mutateAsync } = useAddRecipeInsightSegment();

  const handleAddSubmit = async (data: any) => {
    const response = await mutateAsync(data).then((res) => res);
    return response;
  };

  return (
    <div className="container mx-auto">
      <Form onSubmit={handleAddSubmit} setAddModal={setAddModal} />
    </div>
  );
};

export default AddPage;
