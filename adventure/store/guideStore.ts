import { create } from 'zustand';

export type GuideStep =
  | 'find_load'
  | 'negotiate'
  | 'assign_truck'
  | 'watch_map'
  | 'check_email'
  | 'resolve_event'
  | 'get_paid'
  | 'end_shift'
  | null;

interface GuideStore {
  activeStep: GuideStep;
  bubbleStep: GuideStep;   // шаг для которого показываем bubble (только при CTA-переходе)
  setStep: (step: GuideStep) => void;
  triggerBubble: (step: GuideStep) => void;  // вызывается при нажатии CTA
  clearBubble: () => void;
  clearStep: () => void;
}

export const useGuideStore = create<GuideStore>((set) => ({
  activeStep: null,
  bubbleStep: null,
  setStep: (step) => set({ activeStep: step }),
  triggerBubble: (step) => set({ bubbleStep: step }),
  clearBubble: () => set({ bubbleStep: null }),
  clearStep: () => set({ activeStep: null, bubbleStep: null }),
}));
