import { create } from "zustand";

export interface Customer {
  contact: string;
  email: string;
}

export interface Reservation {
  name: string;
  checkin_date: string;
  checkout_date: string;
  adults: number;
  children: number;
  category: string;
  status: string;
  source_category: string;
  source: string;
  source_ref_no: string;
  customer_id: string;
  labels: string[];
  is_security_received: boolean;
  context: Record<string, unknown>;
  id: string;
  ref_no: string;
  reservation_date: string;
  room_amount: string;
  plan_amount: string;
  extra_amount: string;
  tax_amount: string;
  total_amount: string;
  paid_amount: string;
  refunded_amount: string;
  customer: Customer;
  guest_checkin_count: number;
  cancelled_at: string | null;
}

interface ReservationStore {
  reservation: Reservation | null;
  loading: boolean;
  error: string | null;
  setReservationData: (data: Reservation) => void;
  setReservationLoading: (loading: boolean) => void;
  setReservationError: (error: string | null) => void;
  clearReservation: () => void;
}

export const useReservationStore = create<ReservationStore>((set) => ({
  reservation: null,
  loading: false,
  error: null,

  setReservationData: (data) => set({ reservation: data }),
  setReservationLoading: (loading) => set({ loading }),
  setReservationError: (error) => set({ error }),
  clearReservation: () =>
    set({
      reservation: null,
      loading: false,
      error: null,
    }),
}));
