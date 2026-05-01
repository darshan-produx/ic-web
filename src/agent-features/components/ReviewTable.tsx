'use client';
import React from 'react';

interface ReviewTableProps {
  headers: string[];
  data: Array<{
    customer: string;
    items: any[];
    renderItem: (item: any, index: number) => React.ReactNode;
  }>;
  title?: string;
  className?: string;
  columnWidths?: string[];
}

/**
 * Reusable review table component
 * Used for displaying customer data in review screens (domains, stakeholders, etc.)
 */
export const ReviewTable: React.FC<ReviewTableProps> = ({
  headers,
  data,
  title,
  className = '',
  columnWidths = ['170px', 'auto']
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div style={{ width: '600px' }}>
        {title && (
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        
        <div 
          className="rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className={`text-left text-sm font-medium text-gray-500 border-b ${
                        index < headers.length - 1 ? 'border-r' : ''
                      } border-gray-200`}
                      style={{ 
                        padding: '12px',
                        width: columnWidths[index]
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td 
                      className="text-sm text-gray-900 align-top font-normal border-b border-r border-gray-200"
                      style={{ padding: '12px' }}
                    >
                      {row.customer}
                    </td>
                    <td 
                      className="border-b border-gray-200"
                      style={{ padding: '12px' }}
                    >
                      {row.items.map((item, itemIndex) => 
                        row.renderItem(item, itemIndex)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
