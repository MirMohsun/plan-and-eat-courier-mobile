import type { VersionGateResult } from './version-gate-result';

import { create } from 'zustand';

type AppVersionGateState = {
  result: VersionGateResult | null;
  setResult: (result: VersionGateResult) => void;
};

export const useAppVersionGateStore = create<AppVersionGateState>(set => ({
  result: null,
  setResult: result => set({ result }),
}));
