'use client';
import React, { useState, useEffect } from 'react';
import { DocumentSearchIcon } from '../../app/assests/icons/icons';

interface ScanningFoldersProps {
  onDone?: () => void;
  hasQnAData?: boolean;
}

const ScanningFolders: React.FC<ScanningFoldersProps> = ({
  onDone = () => console.log('Done clicked'),
  hasQnAData = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);

  // Start 5-second timer when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerComplete(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-transition when both timer is complete AND we have QnA data
  useEffect(() => {
    if (timerComplete && hasQnAData && onDone) {
      onDone();
    }
  }, [timerComplete, hasQnAData, onDone]);

  const handleDone = async () => {
    setIsLoading(true);
    try {
      onDone && onDone();
    } catch (error) {
      onDone && onDone();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center mb-8">
      {/* Illustration */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <DocumentSearchIcon className="" />
      </div>

      <h1 className="text-xl font-semibold text-gray-900 mb-2">
       No insights found in the current documents
      </h1>
    
      <p className="font-inter font-normal text-sm leading-5 text-gray-600 mb-6">
       Connect more folders and I will analyse them.
      </p>

      {/* Continue Button */}
      <button
        onClick={handleDone}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </div>
  );
};

export default ScanningFolders;
