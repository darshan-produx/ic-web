import React, { useEffect, useState, useRef } from 'react';
import Modal from './Modal';

interface DeleteDatabaseModalProps {
  show: boolean;
  onClose: () => void;
  onContinue: () => void;
  apiCall: () => Promise<any>;
}

const ANIMATION_DURATION = 5000;

const DeleteDatabaseModal: React.FC<DeleteDatabaseModalProps> = ({
  show,
  onClose,
  onContinue,
  apiCall,
}) => {
  const [animating, setAnimating] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [barStarted, setBarStarted] = useState(false);
  const [apiSuccess, setApiSuccess] = useState<boolean | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!show) {
      setAnimating(false);
      setDisplayPercent(0);
      setBarStarted(false);
      setApiSuccess(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setAnimating(true);
    setDisplayPercent(0);
    setBarStarted(false);
    setApiSuccess(null);
    startTimeRef.current = Date.now();

    apiCall()
      .then((res) => {
        if (res?.status === 200) {
          setApiSuccess(true);
        } else {
          setApiSuccess(false);
        }
      })
      .catch(() => {
        setApiSuccess(false);
      });

    // Kick off the CSS transition after a frame so the bar starts from 0
    requestAnimationFrame(() => {
      setBarStarted(true);
    });

    // Update only the displayed percentage number via interval
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(Math.round((elapsed / ANIMATION_DURATION) * 100), 100);
      setDisplayPercent(pct);
      if (pct >= 100) {
        setAnimating(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [show]);

  const animationDone = !animating && displayPercent >= 100;
  const failed = animationDone && apiSuccess === false;
  const succeeded = animationDone && apiSuccess === true;

  return (
    <Modal
      show={show}
      onHide={() => { }}
      id="deleteDatabaseModal"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4 top-2/4"
      dialogClassName="w-screen md:w-[28rem] bg-white shadow-xl rounded-xl dark:bg-zink-600 overflow-hidden"
    >
      <Modal.Body className="px-8 pt-10 pb-8">
        <div className="flex flex-col items-center text-center">
          {/* Icon area */}
          {!failed ? (
            <div className="relative mb-6">
              <div
                className={`w-[72px] h-[72px] rounded-full flex items-center justify-center ${succeeded ? 'bg-green-50' : 'bg-red-50'
                  }`}
              >
                {succeeded ? (
                  <svg
                    className="w-9 h-9 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <>
                    <svg
                      className={`w-9 h-9 text-red-500 ${animating ? 'animate-pulse' : ''
                        }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
                    </svg>
                    {animating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[72px] h-[72px] border-[3px] border-red-200 border-t-red-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-[72px] h-[72px] rounded-full bg-red-50 flex items-center justify-center">
                <svg
                  className="w-9 h-9 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {failed
              ? 'Unable to Delete'
              : succeeded
                ? 'Database Deleted'
                : 'Deleting Database'}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed max-w-[300px]">
            {failed
              ? 'We were unable to delete the database for your organization. Please try again later.'
              : succeeded
                ? 'Your database has been successfully deleted.'
                : 'We are deleting the database for your organization. Please do not close this window.'}
          </p>

          {/* Progress section */}
          {!failed && !succeeded && (
            <div className="w-full mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Progress
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {displayPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-[6px] overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{
                    width: barStarted ? '100%' : '0%',
                    transition: barStarted
                      ? `width ${ANIMATION_DURATION}ms linear`
                      : 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Modal.Body>

      <div className="px-8 pb-8">
        <div className="flex justify-center">
          {failed ? (
            <button
              type="button"
              className="w-full py-2.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              disabled={!succeeded}
              className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${succeeded
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              onClick={onContinue}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DeleteDatabaseModal;
