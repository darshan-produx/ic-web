import { X } from 'lucide-react';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  readTranscriptModalOpen: any;
  setReadTranscriptModalOpen: any;
  meetingName: string;
  transcriptContent: any;
}

const ReadTranscriptModal = ({
  readTranscriptModalOpen,
  setReadTranscriptModalOpen,
  meetingName,
  transcriptContent,
}: Props) => {
  useEffect(() => {
    if (readTranscriptModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReadTranscriptModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden'); // Ensure overflow is reset
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [readTranscriptModalOpen, setReadTranscriptModalOpen]);

  return (
    <div>
      <div
        className={`${
          readTranscriptModalOpen
            ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[500]'
            : 'hidden'
        }`}
        onClick={() => setReadTranscriptModalOpen(false)}
      >
        {/* Modal Content */}
        <div className=""></div>
        <div
          className={`w-[850px] ml-auto z-[501] overflow-hidden h-[100vh] bg-gray-50 ${
            readTranscriptModalOpen ? 'translate-x-0' : 'translate-x-full'
          }  transition-transform duration-800 ease-in-out      
`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="border-b-[1px] border-gray-200 px-[20px] py-[15px] flex justify-between">
            <h3 className="text-[16px] !font-[400] text-gray-800">
              Transcript of "{meetingName}”
            </h3>
            <span
              onClick={() => {
                setReadTranscriptModalOpen(false);
              }}
              className="cursor-pointer"
            >
              <X className="" size={20} />
            </span>
          </div>
          <div className="px-[20px] py-[20px] overflow-auto max-h-[calc(theme('height.screen')_-_56px)] scroll">
            <ReactMarkdown
              children={transcriptContent ?? ''}
              remarkPlugins={[remarkGfm]}
              className={'markdown list-disc list-inside'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadTranscriptModal;
