import { Signal } from "../journey/signalCard";

type SignalSectionProps = {
  title: string;
  signals: any[];
  setIsSideDrawerOpen: (open: boolean) => void;
  setSelectedSignalId: (id: string) => void;
  showSeparator?: boolean;
};

export default function SignalSection({
  title,
  signals,
  setIsSideDrawerOpen,
  setSelectedSignalId,
  showSeparator = true
}: SignalSectionProps) {
  return (
    <div className="w-full">
      {title ? (
        <h2 className="text-[16px] font-semibold mb-4 mt-2 text-left text-[#202B37]">
          {title}
        </h2>
      ) : null}

      <div className="grid grid-cols-2 gap-6">
        {signals.map((signal) => (
          <div key={signal._id}>
            <Signal
              signal={signal}
              setIsSideDrawerOpen={setIsSideDrawerOpen}
              setSelectedSignalId={setSelectedSignalId}
              showTimeline={false}
            />
          </div>
        ))}
      </div>
      {signals.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          {/* No {title.toLowerCase()} found */}
          No open issues found
        </div>
      )}

      {showSeparator && (
        <div className="border-b border-gray-200 mt-6" style={{ height: '1px' }} />
      )}
    </div>
  );
}
