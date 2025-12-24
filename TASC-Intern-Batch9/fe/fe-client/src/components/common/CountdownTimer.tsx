import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; 
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return <span className="text-sm font-bold text-gray-200">Đã kết thúc</span>;
  }

  // Helper render ô số
  const TimeBox = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[44px] text-center border border-white/10 shadow-sm">
        <span className="text-xl font-bold text-white leading-none font-mono">
          {val < 10 ? `0${val}` : val}
        </span>
      </div>
      <span className="text-[10px] text-white/80 uppercase mt-1 font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      {/* Luôn hiện ngày, kể cả bằng 0 để user biết */}
      <TimeBox val={timeLeft.days} label="Ngày" />
      <span className="text-white/50 font-bold -mt-4">:</span>
      <TimeBox val={timeLeft.hours} label="Giờ" />
      <span className="text-white/50 font-bold -mt-4">:</span>
      <TimeBox val={timeLeft.minutes} label="Phút" />
      <span className="text-white/50 font-bold -mt-4">:</span>
      <TimeBox val={timeLeft.seconds} label="Giây" />
    </div>
  );
};

export default CountdownTimer;