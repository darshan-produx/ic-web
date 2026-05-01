import { useState, useEffect } from 'react';
import { MainLogo } from '../../../assests/icons/icons';

const slides = [
  {
    title: 'Redefine Account Management',
    description: 'Transform how you work, one decision at a time',
  },
  {
    title: 'Focus on What Matters',
    description: 'AI-driven insights to simplify your day-to-day',
  },
  {
    title: 'Stay Ahead, Stay Connected',
    description: 'Seamless collaboration for smarter customer engagement',
  },
  //   {
  //     title: 'Your Success, Simplified',
  //     description: 'Turn data into decisions with precision guidance',
  //   },
  //   {
  //     title: 'Empower Every Interaction',
  //     description: 'Turn data into decisions with precision guidance',
  //   },
];

export default function LoginContent() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="items-start flex flex-col w-[700px]">
      <span>
        <MainLogo className="h-[57px] w-[229px] px-0 " />
      </span>
      <span className="text-[76px] font-bold line-height-[91px] text-[#B9C3D1] pt-[90px] transition-all duration-500 ease-in-out leading-[100px]">
        {slides[currentIndex].title}
      </span>

      <span className="text-[18px] font-normal line-height-[21px] text-[#637083] pt-[10px] transition-all duration-500 ease-in-out">
        {slides[currentIndex].description}
      </span>

      <div className="flex gap-3 pt-[24px] transition-all duration-500 ease-in-out">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-[10px] h-[10px] rounded-full cursor-pointer ${
              index === currentIndex
                ? 'bg-gray-700 transition-all duration-500 ease-in-out'
                : 'bg-gray-300 transition-all duration-500 ease-in-out'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
