import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "@/lib/types";

export type SavedAddress = Address & { id: string; label: string; isDefault?: boolean };

const seedAddresses: SavedAddress[] = [
  {
    id: "addr-1",
    label: "Home",
    firstName: "Jordan",
    lastName: "Ellis",
    address1: "482 Ivory Lane",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    isDefault: true,
  },
];

type AddressesState = {
  addresses: SavedAddress[];
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
};

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set) => ({
      addresses: seedAddresses,
      addAddress: (address) =>
        set((state) => ({
          addresses: [...state.addresses, { ...address, id: `addr-${Date.now()}` }],
        })),
      removeAddress: (id) =>
        set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) })),
    }),
    { name: "peptiva-addresses" }
  )
);
