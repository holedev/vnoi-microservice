export const handleDatetime = (datetime, withSeconds = false) => {
  const dateOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };

  if (withSeconds) dateOptions.second = "2-digit";

  return new Date(datetime).toLocaleString("en-GB", dateOptions);
};

export const handleTimeProblem = (timeStart, timeTest) => {
  const now = new Date();
  const start = new Date(timeStart);
  start.setSeconds(0, 0);
  const end = new Date(start.getTime() + timeTest * 60 * 1000);

  const isValid = now <= end && now >= start;

  return { end: end.toISOString().slice(0, 16) + ":00.000Z", isValid };
};
