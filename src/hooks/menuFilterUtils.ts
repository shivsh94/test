type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
interface Timing {
  start: string;
  end: string;
}
interface Context {
  days?: Record<DayOfWeek, boolean>;
  timings?: Timing[];
}

export const getCurrentDay = (): DayOfWeek => {
  const days: DayOfWeek[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getUTCDay()];
};

export const getCurrentUTCTime = (): string => {
  const now = new Date();
  const hours = now.getUTCHours().toString().padStart(2, "0");
  const minutes = now.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getDayName = (day: DayOfWeek): string => {
  const dayNames: Record<DayOfWeek, string> = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  return dayNames[day];
};

export const isAvailableOnDay = (
  item: { context?: Context },
  day: DayOfWeek | null
): boolean => {
  if (!day) return true;
  return item.context?.days?.[day] === true || false;
};

export const isAvailableAtTime = (
  item: { context?: Context },
  time: Timing | null
): boolean => {
  if (!time) return true;
  if (!item.context?.timings || item.context.timings.length === 0) return true;

  const currentTime = time.start;
  const [currentHours, currentMinutes] = currentTime.split(":").map(Number);
  const currentTotal = currentHours * 60 + currentMinutes;

  return item.context.timings.some((timing) => {
    if (!timing.start || !timing.end) return true;

    const startTimeStr = timing.start.split("+")[0];
    const endTimeStr = timing.end.split("+")[0];

    const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
    const [endHours, endMinutes] = endTimeStr.split(":").map(Number);

    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    return currentTotal >= startTotal && currentTotal <= endTotal;
  });
};
