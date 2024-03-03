export const handleTime = (time, withSeconds = false) => {
  const dateOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  };

  if (withSeconds) dateOptions.second = "2-digit";

  return new Date(time).toLocaleString("en-GB", dateOptions);
};
