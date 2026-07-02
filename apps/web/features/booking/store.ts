import { create } from "zustand";

export type BookingState = {
  service: string | null;
  location: { address: string; city: string; postcode: string };
  schedule: { date: string; time: string };
  notes: string;
  contact: { name: string; email: string; phone: string };
  uploads: { name: string; size: number }[];

  setService: (slug: string) => void;
  setLocation: (l: Partial<BookingState["location"]>) => void;
  setSchedule: (s: Partial<BookingState["schedule"]>) => void;
  setNotes: (n: string) => void;
  setContact: (c: Partial<BookingState["contact"]>) => void;
  addUpload: (file: { name: string; size: number }) => void;
  removeUpload: (name: string) => void;
  reset: () => void;
};

const initial = {
  service: null as string | null,
  location: { address: "", city: "", postcode: "" },
  schedule: { date: "", time: "" },
  notes: "",
  contact: { name: "", email: "", phone: "" },
  uploads: [] as { name: string; size: number }[],
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initial,
  setService: (slug) => set({ service: slug }),
  setLocation: (l) => set((s) => ({ location: { ...s.location, ...l } })),
  setSchedule: (sc) => set((s) => ({ schedule: { ...s.schedule, ...sc } })),
  setNotes: (n) => set({ notes: n }),
  setContact: (c) => set((s) => ({ contact: { ...s.contact, ...c } })),
  addUpload: (f) =>
    set((s) =>
      s.uploads.find((u) => u.name === f.name)
        ? s
        : { uploads: [...s.uploads, f] },
    ),
  removeUpload: (name) =>
    set((s) => ({ uploads: s.uploads.filter((u) => u.name !== name) })),
  reset: () => set(initial),
}));
