import { PROVIDER } from "@/lib/env";
import type { DataStore } from "./types";
import { mockStore } from "./mockStore";
import { firebaseStore } from "./firebaseStore";

export function getDataStore(): DataStore {
  return PROVIDER === "firebase" ? firebaseStore : mockStore;
}
