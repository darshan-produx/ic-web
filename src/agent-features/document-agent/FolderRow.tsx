// --- Helper Components ---
import SingleSelectPortal from '../../common/portaldropdown/SingleSelectPortal';
import { MinusCircleIcon, PlusCircleIcon } from '../../app/assests/icons/icons';
import { FolderNode } from './ReviewFolders';
import { FolderType } from '../../app/api/agents/agent-types';
import { useRef, useState } from 'react';
import {
  fileTypeOptions,
  folderTypeOptions,
  rootFolderTypeOptions,
} from './options';
import { ChevronDown, X } from 'lucide-react';

interface FolderRowProps {
  node: FolderNode;
  customerOptions: { label: string; value: number }[];
  onToggleExpand: (id: string) => void;
  onUpdateType: (
    id: string,
    type: FolderType | undefined,
    isRootFolder: boolean
  ) => void;
  onUpdateCustomer: (
    id: string,
    customerId: number,
    isRootFolder: boolean
  ) => void;
  isLastRow?: boolean;
}

const FolderRow: React.FC<FolderRowProps> = ({
  node,
  customerOptions,
  onToggleExpand,
  onUpdateType,
  onUpdateCustomer,
  isLastRow = false,
}) => {
  // Local state for dropdowns prevents re-rendering the whole tree
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const typeTriggerRef = useRef<HTMLDivElement>(null);
  const customerTriggerRef = useRef<HTMLDivElement>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isRootFolder = node.isRoot || node.indent === 0;

  // Use same options for all
  const typeOptions = isRootFolder
    ? rootFolderTypeOptions
    : hasChildren
    ? folderTypeOptions
    : fileTypeOptions;

  const getTypeDisplayLabel = () => {
    if (!node.type) return 'Select';
    const option = typeOptions.find((opt) => opt.value === node.type);
    return option?.label || 'Select';
  };

  const getCustomerDisplayLabel = () => {
    if (!node.customerId) return '';
    const option = customerOptions.find((opt) => opt.value === node.customerId);
    return option?.label || '';
  };

  const rows: React.ReactNode[] = [];

  // All rows should have bottom border except the very last row in the entire table
  const showBottomBorder = !isLastRow || (hasChildren && node.isExpanded);

  rows.push(
    <tr key={node.id}>
      <td
        className={`text-[14px] text-gray-900 align-middle font-normal border-r border-gray-200 ${
          showBottomBorder ? 'border-b border-gray-200' : ''
        }`}
        style={{ height: '36px', padding: '8px 12px' }}
      >
        <div
          className="flex items-center gap-[4px]"
          style={{ paddingLeft: `${node.indent * 24}px` }}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="text-gray-500 transition-colors flex-shrink-0 hover:text-gray-700 cursor-pointer"
            >
              {node.isExpanded ? (
                <MinusCircleIcon className="w-4 h-4 pointer-events-none" />
              ) : (
                <PlusCircleIcon className="w-4 h-4 pointer-events-none" />
              )}
            </button>
          )}
          {!hasChildren && node.indent > 0 && <div className="w-4"></div>}
          <span className="text-[14px] text-gray-900">{node.name}</span>
        </div>
      </td>
      <td
        className={`border-r border-gray-200 ${
          showBottomBorder ? 'border-b border-gray-200' : ''
        }`}
        style={{ height: '36px', padding: '8px 12px' }}
      >
        <div className="relative">
          <div
            ref={typeTriggerRef}
            onClick={(e) => {
              e.stopPropagation();
              if (!node.type) {
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
              }
            }}
            className="flex items-center justify-between cursor-pointer text-[14px]"
          >
            <span className={!node.type ? 'text-gray-500' : 'text-gray-900'}>
              {getTypeDisplayLabel()}
            </span>
            {node.type ? (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onUpdateType(node.id, undefined, isRootFolder);
                }}
                className="flex-shrink-0 hover:bg-gray-100 rounded p-1 cursor-pointer"
              >
                <X className="w-3 h-3 text-gray-500 hover:text-gray-700 pointer-events-none" />
              </button>
            ) : (
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${
                  isTypeDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            )}
          </div>
          <SingleSelectPortal
            isOpen={isTypeDropdownOpen}
            triggerRef={typeTriggerRef}
            options={typeOptions}
            selectedValue={node.type}
            onSelectionChange={(value) => {
              onUpdateType(node.id, value as FolderType, isRootFolder);
              setIsTypeDropdownOpen(false);
            }}
            onClose={() => setIsTypeDropdownOpen(false)}
            showSearch={false}
            placement="auto"
          />
        </div>
      </td>
      <td
        className={`${showBottomBorder ? 'border-b border-gray-200' : ''}`}
        style={{
          height: '36px',
          padding: '8px 12px',
          backgroundColor: !node.type ? '#F9FAFB' : 'transparent',
        }}
      >
        {node.type === FolderType.CUSTOMER && (
          <div className="relative">
            <div
              ref={customerTriggerRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsCustomerDropdownOpen(!isCustomerDropdownOpen);
              }}
              className="flex items-center gap-1 cursor-pointer text-[14px]"
            >
              <span
                className={node.customerId ? 'text-gray-900' : 'text-gray-500'}
              >
                {node.customerId
                  ? getCustomerDisplayLabel()
                  : 'Select customer'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isCustomerDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
            <SingleSelectPortal
              isOpen={isCustomerDropdownOpen}
              triggerRef={customerTriggerRef}
              options={customerOptions}
              selectedValue={node.customerId ? node.customerId : ''}
              onSelectionChange={(value) => {
                onUpdateCustomer(node.id, parseInt(value, 10), isRootFolder);
                setIsCustomerDropdownOpen(false);
              }}
              onClose={() => setIsCustomerDropdownOpen(false)}
              showSearch={true}
              placeholder="Search customer..."
              placement="auto"
              maxHeight={250}
            />
          </div>
        )}
      </td>
    </tr>
  );

  // 2. Recursively render children
  if (node.isExpanded && hasChildren) {
    const childCount = node.children!.length;
    node.children!.forEach((child, index) => {
      rows.push(
        <FolderRow
          key={child.id}
          node={child}
          customerOptions={customerOptions}
          onToggleExpand={onToggleExpand}
          onUpdateType={onUpdateType}
          onUpdateCustomer={onUpdateCustomer}
          isLastRow={isLastRow && index === childCount - 1}
        />
      );
    });
  }

  return <>{rows}</>;
};

export default FolderRow;
