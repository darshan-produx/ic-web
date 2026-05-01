import { ReactNode } from 'react';

interface FlipCardProps {
  isFlipped: boolean;
  front: ReactNode;
  back: ReactNode;
}

export default function FlipCard({
  isFlipped,
  front,
  back,
}: FlipCardProps) {
  return (
    <div className="relative w-full h-full perspective-1000">
      <div
        className={`relative w-full h-full duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute inset-0 backface-hidden">{front}</div>
        {isFlipped && <div className="absolute inset-0 rotate-y-180 backface-hidden">
          {back}
        </div>}
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
