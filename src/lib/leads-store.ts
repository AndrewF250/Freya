const LEADS_KEY = "freya-leads";

export type LeadKind = "order" | "booking";
export type LeadStatus = "new" | "done";

export type LeadItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
};

export type LeadQuiz = {
  summary: string[];
  products: string[];
};

export type Lead = {
  id: string;
  kind: LeadKind;
  status: LeadStatus;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  service?: string;
  delivery?: string;
  date?: string;
  time?: string;
  total?: number;
  items?: LeadItem[];
  quiz?: LeadQuiz;
};

function readLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? (JSON.parse(raw) as Lead[]) : [];
  } catch {
    return [];
  }
}

function writeLeads(leads: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function getLeads(): Lead[] {
  return readLeads().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addLead(data: Omit<Lead, "id" | "createdAt" | "status">): Lead {
  const lead: Lead = {
    ...data,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  writeLeads([lead, ...readLeads()]);
  return lead;
}

export function markLeadDone(id: string) {
  writeLeads(readLeads().map((l) => (l.id === id ? { ...l, status: "done" as const } : l)));
}

export function restoreLead(id: string) {
  writeLeads(readLeads().map((l) => (l.id === id ? { ...l, status: "new" as const } : l)));
}

export function deleteLead(id: string) {
  writeLeads(readLeads().filter((l) => l.id !== id));
}

export function importLeads(leads: Lead[]) {
  const existing = readLeads();
  const ids = new Set(existing.map((l) => l.id));
  const merged = [...leads.filter((l) => !ids.has(l.id)), ...existing];
  writeLeads(merged);
}
