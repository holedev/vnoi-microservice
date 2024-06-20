import { useState, useEffect } from "react";

const CountdownTimer = ({ timeEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  function calculateTimeRemaining() {
    const endTime = timeEnd.getTime();
    const now = new Date().getTime();
    return endTime - now || 0;
  }

  useEffect(() => {
    if (timeRemaining > 0) {
      const intervalId = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 1000);

      // Dọn dẹp khi unmount
      return () => clearInterval(intervalId);
    }
  }, [timeRemaining]);

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <span
      style={{
        height: "22px"
      }}
    >
      {`0${hours}`.slice(-2)}:{`0${minutes}`.slice(-2)}:{`0${seconds}`.slice(-2)}
    </span>
  );
};

export default CountdownTimer;
