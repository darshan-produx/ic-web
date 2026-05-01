import { ChevronDown } from 'lucide-react';
import { Dropdown } from '../Dropdown';
interface props {
  title: string;
  options: any;
}
export default function OutlineDropdown({ title, options }: props) {
  return (
    <Dropdown className="relative">
      <Dropdown.Trigger
        type="button"
        className="dropdown-toggle btn bg-white border-slate-500 dark:border-zink-400 text-gray-900"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
      >
        {title}
        <ChevronDown className="inline-block size-4 ltr:ml-1 rtl:mr-1 "></ChevronDown>
      </Dropdown.Trigger>

      <Dropdown.Content
        placement="start-end"
        as="ul"
        className="absolute z-50 py-2 mt-5 list-none bg-white rounded-md shadow-md ltr:text-left rtl:text-right dropdown-menu min-w-max dark:bg-zink-600"
        aria-labelledby="dropdownMenuButton"
      >
        <li>
          <a
            className="block px-4 py-1.5 text-base font-medium transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
            href="#!"
          >
            Action
          </a>
        </li>
        <li>
          <a
            className="block px-4 py-1.5 text-base font-medium transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
            href="#!"
          >
            Another action
          </a>
        </li>
        <li>
          <a
            className="block px-4 py-1.5 text-base font-medium transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
            href="#!"
          >
            Something else here
          </a>
        </li>
        <li className="pt-2 mt-2 border-t border-slate-200 dark:border-zink-500">
          <a
            className="block px-4 py-1.5 text-base font-medium transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200"
            href="#!"
          >
            Your Link
          </a>
        </li>
      </Dropdown.Content>
    </Dropdown>
  );
}
