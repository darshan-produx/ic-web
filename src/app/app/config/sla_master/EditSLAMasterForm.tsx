import React from 'react';
import { useEditSLAMaster } from '../../../services/mutations/configMutations';
import SLAMasterForm from './SLAMasterForm';
import { toast } from 'react-toastify';
const EditPage: React.FC<{ setEditModal: any; editData: any }> = ({
  setEditModal,
  editData,
}) => {
  const { mutateAsync } = useEditSLAMaster();
  const handleEditSubmit = async (data: any) => {
    try {
      const res = await mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast.success('Ticket SLA updated successfully');
        setEditModal(false);
      }
    } catch (err: any) {
      toast.error(err.response.data.message);
      setEditModal(false);
    }
  };

  return (
    <div className="container mx-auto">
      <SLAMasterForm
        onSubmit={handleEditSubmit}
        setEditModal={setEditModal}
        editData={editData}
      />
    </div>
  );
};

export default EditPage;
