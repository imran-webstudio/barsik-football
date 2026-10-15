export const positions = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
] as const;

export type Position = (typeof positions)[number];

export const tournament = {
  date: "23 October 2026",
  time: "8:00 AM",
  place: "Your Village Field",
  deadline: "22 October",
  payMethod: "bKash / Nagad (Send Money)",
  payNumber: "01737338293",
  contact: "01737338293",
};
