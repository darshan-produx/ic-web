import React from 'react';
import { useAddSLAMaster } from '../../../services/mutations/configMutations';
import SLAMasterForm from './SLAMasterForm';
import { toast } from 'react-toastify';
const AddPage: React.FC<{ setAddModal: any }> = ({ setAddModal }) => {
  const { mutateAsync } = useAddSLAMaster();
  const handleAddSubmit = async (data: any) => {
    try {
      const res = await mutateAsync(data);
      if (res?.status == 200 || res?.status == 201) {
        toast.success('Ticket SLA added successfully');
        setAddModal(false);
      }
    } catch (err: any) {
      toast.error(err.response.data.message);
      setAddModal(false);
    }
  };

  return (
    <div className="container mx-auto">
      <SLAMasterForm onSubmit={handleAddSubmit} setAddModal={setAddModal} />
    </div>
  );
};

export default AddPage;
