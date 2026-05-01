
import { CanbanViewSvgIcon, GridViewSvgIcon } from "../../../../assests/icons/icons";
interface ChangeViewProps {
    view: string;
    setView: (view: string) => void;
}
export const ChangeView = (
    {
        view = 'kanban',
        setView
    }: ChangeViewProps
) => {
    return (
        <div className="w-[104px] h-8 flex items-center box-border">
            <span className={`h-full w-[52px] flex items-center justify-center border-[1px] border-[#CED2DA] rounded-l-[8px] box-border cursor-pointer ${view === 'kanban' ? 'bg-[#F2F4F7]' : ''}`} onClick={() => setView('kanban')}><CanbanViewSvgIcon /></span>
            <span className={`h-full w-[52px] flex items-center justify-center border-[1px] border-[#CED2DA] rounded-r-[8px] border-l-0 box-border ${view === 'grid' ? 'bg-[#F2F4F7]' : ''}`} onClick={() => setView('grid')}><GridViewSvgIcon /></span>
        </div>
    );
};