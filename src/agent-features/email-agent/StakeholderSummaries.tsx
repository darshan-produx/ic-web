'use client';
import React from 'react';
import ActiveTabs from './ActiveTabs';
import { EmailIcon } from '../../app/assests/icons/icons';

interface Stakeholder {
  name: string;
  emailCount: number;
  tags: string[];
}

interface Customer {
  name: string;
  stakeholders: Stakeholder[];
}

interface StakeholderSummariesProps {}

const StakeholderSummaries: React.FC<StakeholderSummariesProps> = () => {
  const customers: Customer[] = [
    {
      name: 'Pinelabs',
      stakeholders: [
        {
          name: 'Rohit Sharma',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        },
        {
          name: 'Virat Kohli',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        }
      ]
    },
    {
      name: 'Swiggy',
      stakeholders: [
        {
          name: 'Sachin Tendulkar',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        }
      ]
    },
    {
      name: 'SportsDraft',
      stakeholders: [
        {
          name: 'Mahendrasingh Dhoni',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        }
      ]
    },
    {
      name: 'Pinto',
      stakeholders: [
        {
          name: 'Yuvraj Singh',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        },
        {
          name: 'Irfan Pathan',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        }
      ]
    },
    {
      name: 'IndiaMart',
      stakeholders: [
        {
          name: 'Parthiv Patel',
          emailCount: 34,
          tags: ['Upsell opportunities', 'Renewal followups']
        }
      ]
    }
  ];

  return (
    <ActiveTabs defaultTab="summaries">
      {(activeTab) => (
        <>
          {activeTab === 'summaries' && (
            <div className="flex justify-center">
              <div style={{ width: '600px' }}>
                <div className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left text-sm font-medium text-gray-500 border-b border-r border-gray-200" style={{ padding: '12px', width: '170px' }}>
                            Customer
                          </th>
                          <th className="text-left text-sm font-medium text-gray-500 border-b border-gray-200" style={{ padding: '12px' }}>
                            Stakeholders
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {customers.map((customer, customerIndex) => (
                          <tr key={customerIndex}>
                            <td className="text-sm text-gray-900 align-top font-normal border-b border-r border-gray-200" style={{ padding: '8px 12px', width: '170px' }}>
                              {customer.name}
                            </td>
                            <td className="border-b border-gray-200" style={{ padding: '8px 12px' }}>
                              <div className="space-y-4">
                                {customer.stakeholders.map((stakeholder, stakeholderIndex) => (
                                  <div key={stakeholderIndex} className="border border-gray-200" style={{ width: '359px', borderRadius: '12px', padding: '8px 12px', gap: '4px' }}>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-900">
                                        {stakeholder.name}
                                      </span>
                                      <button className="text-sm text-gray-600 hover:text-gray-900">
                                        Read more
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-600">{stakeholder.emailCount}</span>
                                        <EmailIcon className="w-4 h-4 text-gray-400" />
                                      </div>
                                      <div className="h-4 w-px bg-gray-300"></div>
                                      <div className="flex items-center gap-1">
                                        {stakeholder.tags.map((tag, tagIndex) => (
                                          <span key={tagIndex} className="text-xs text-gray-500">
                                            {tag}{tagIndex < stakeholder.tags.length - 1 ? ',' : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </ActiveTabs>
  );
};

export default StakeholderSummaries;
