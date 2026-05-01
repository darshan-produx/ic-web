import Modal from '../../../../../common/components/Modal';
import AddStakeholder from './addStakeholder';

interface props {
  addStakeholderForm: any;
  setAddStakeholderForm: any;
  editData?: any;
}
export default function AddStakeholderModal({
  addStakeholderForm,
  setAddStakeholderForm,
  editData,
}: props) {
  return (
    <>
      <AddStakeholder
        setAddStakeholderForm={setAddStakeholderForm}
        editData={editData}
        addStakeholderForm={addStakeholderForm}
      />
    </>
  );
}
