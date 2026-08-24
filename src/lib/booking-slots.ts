export type SlotPreset = {
  id: string;
  name: string;
  slots: string[];
};

export const DEFAULT_BOOKING_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export const DEFAULT_SLOT_PRESETS: SlotPreset[] = [
  {
    id: "weekday",
    name: "Будни",
    slots: ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
  },
  {
    id: "morning",
    name: "Утро",
    slots: ["10:00", "11:00", "12:00", "13:00"],
  },
  {
    id: "evening",
    name: "Вечер",
    slots: ["15:00", "16:00", "17:00", "18:00", "19:00"],
  },
  {
    id: "saturday",
    name: "Суббота",
    slots: ["10:00", "12:00", "14:00", "16:00", "18:00"],
  },
];

export const DEFAULT_IMAGE_BG_PRESETS = ["#ffffff", "#f5f6f1", "#f8f8f8", "#fafafa", "#f2f2f2"];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeTimeSlot(value: string): string | null {
  const trimmed = value.trim();
  if (!TIME_RE.test(trimmed)) return null;
  return trimmed;
}

export function sortTimeSlots(slots: string[]): string[] {
  return [...new Set(slots)].sort((a, b) => a.localeCompare(b, "ru"));
}

export function parseBookingSlots(source?: { bookingSlots?: string[] }): string[] {
  const slots = source?.bookingSlots?.filter(Boolean);
  return slots?.length ? sortTimeSlots(slots) : DEFAULT_BOOKING_SLOTS;
}

export function parseSlotPresets(source?: { bookingSlotPresets?: SlotPreset[] }): SlotPreset[] {
  const presets = source?.bookingSlotPresets?.filter((p) => p.name && p.slots?.length);
  return presets?.length ? presets : DEFAULT_SLOT_PRESETS;
}

export function parseImageBgPresets(source?: { imageBgPresets?: string[] }): string[] {
  const presets = source?.imageBgPresets?.filter(Boolean);
  return presets?.length ? presets : DEFAULT_IMAGE_BG_PRESETS;
}
