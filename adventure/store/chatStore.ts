import { create } from 'zustand';

export interface ChatMessage {
  from: 'character' | 'player';
  text: string;
  timestamp: number;
}

export interface ChatThread {
  characterKey: string;
  characterName: string;
  characterAvatar: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface ChatStore {
  threads: Record<string, ChatThread>; // key = characterKey
  addMessage: (characterKey: string, characterName: string, characterAvatar: string, msg: ChatMessage) => void;
  getThread: (characterKey: string) => ChatThread | null;
  loadFromProfile: (nickname: string) => void;
  saveToProfile: (nickname: string) => void;
}

function getStorageKey(nickname: string) {
  return `chat-history-${nickname}`;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  threads: {},

  addMessage: (characterKey, characterName, characterAvatar, msg) => {
    set(state => {
      const existing = state.threads[characterKey];
      const updated: ChatThread = {
        characterKey,
        characterName,
        characterAvatar,
        messages: [...(existing?.messages || []), msg],
        lastUpdated: Date.now(),
      };
      return { threads: { ...state.threads, [characterKey]: updated } };
    });
  },

  getThread: (characterKey) => {
    return get().threads[characterKey] || null;
  },

  loadFromProfile: (nickname) => {
    try {
      const raw = localStorage.getItem(getStorageKey(nickname));
      if (raw) {
        const threads = JSON.parse(raw);
        set({ threads });
      } else {
        set({ threads: {} });
      }
    } catch { set({ threads: {} }); }
  },

  saveToProfile: (nickname) => {
    try {
      localStorage.setItem(getStorageKey(nickname), JSON.stringify(get().threads));
    } catch {}
  },
}));
