import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DatesState {
  checkIn: Date;
  checkOut: Date;
  setDates: (checkIn: Date, checkOut: Date) => void;
}

export const useDates = create<DatesState>()(
  persist(
    (set) => ({
      checkIn: new Date("2024-04-02"),
      checkOut: new Date("2024-04-06"),
      setDates: (checkIn: Date, checkOut: Date) => set({ checkIn, checkOut }),
    }),
    {
      name: "dates-storage",
    }
  )
);
