import { atom } from "jotai";

const toastAtom = atom<string | null>(null);
export const tempToastAtom = atom(
    (get) => get(toastAtom),
    (_, set, payload: { message: string; timeout?: number } | string) => {
        if (typeof payload === "string") {
            payload = { message: payload };
        }

        // set toast message
        set(toastAtom, payload.message);

        // clear toast after 3 seconds
        setTimeout(() => {
            set(toastAtom, null);
        }, payload?.timeout ?? 2200);
    }
);
