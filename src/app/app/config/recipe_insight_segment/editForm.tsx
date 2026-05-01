import React from 'react';
import Form from './form';
import { useEditRecipeInsightSegment } from '../../../services/mutations/configMutations';

const EditPage: React.FC<{ setEditModal: any; editData: any }> = ({
  setEditModal,
  editData,
}) => {
  const { mutateAsync } = useEditRecipeInsightSegment();

  editData = {
    _id: editData?._id,
    recipe_id: editData?.recipe_id,
    insight_id: editData?.insight_id,
    customer_segment_id: editData?.customer_segment_id,
  };
  const handleEditSubmit = async (data: any) => {
    return await mutateAsync(data).then((res) => res);
  };

  return (
    <div className="container mx-auto">
      <Form
        onSubmit={handleEditSubmit}
        setEditModal={setEditModal}
        editData={editData}
      />
    </div>
  );
};

export default EditPage;
