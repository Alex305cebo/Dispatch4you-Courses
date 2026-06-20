// ═══════════════════════════════════════════════════════
//  negotiation.ts — торг с брокерами (V2 улучшенный)
//
//  Изменения vs V1:
//  - Брокер соглашается чаще (порог ниже)
//  - Больше раундов (до 4)
//  - Расширенные ответы брокера
//  - Контр-оффер ближе к предложению игрока
// ═══════════════════════════════════════════════════════
import { getLoadMeta } from './loadGenerator';

export type BrokerMood = 'happy' | 'neutral' | 'annoyed' | 'angry';

export interface NegotiationState {
  open: boolean;
  loadId: string | null;
  postedRate: number;
  currentOffer: number;
  round: number;
  maxRounds: number;
  brokerMood: BrokerMood;
  brokerName: string;
}

export const INITIAL_NEGOTIATION: NegotiationState = {
  open: false,
  loadId: null,
  postedRate: 0,
  currentOffer: 0,
  round: 0,
  maxRounds: 4,
  brokerMood: 'neutral',
  brokerName: '',
};

export type NegotiationResult = 'accepted' | 'counter' | 'rejected';

/**
 * Обработка предложения игрока.
 * V2: брокер соглашается чаще, контр-офферы ближе к игроку.
 */
export function processOffer(
  state: NegotiationState,
  playerOffer: number,
  brokerRelationship = 50
): { result: NegotiationResult; newState: NegotiationState; agreedRate?: number } {
  const meta = state.loadId ? getLoadMeta(state.loadId) : null;
  if (!meta) {
    return { result: 'rejected', newState: { ...state, open: true } };
  }

  const { minRate, marketRate } = meta;
  const round = state.round + 1;

  // V2: Порог принятия НИЖЕ — брокер соглашается легче
  // minRate уже 78% от market. Теперь порог = minRate * 0.9 (ещё ниже)
  const acceptThreshold = Math.round(minRate * 0.9);

  // Агрессивность: насколько игрок просит выше posted
  const overPosted = (playerOffer - state.postedRate) / state.postedRate;

  // Настроение брокера (V2: менее агрессивный)
  let brokerMood: BrokerMood = 'neutral';
  if (overPosted > 0.35) brokerMood = 'angry';
  else if (overPosted > 0.25) brokerMood = 'annoyed';
  else if (overPosted < 0.08) brokerMood = 'happy';

  // Отказ только если ОЧЕНЬ агрессивно И не первый раунд
  if (brokerMood === 'angry' && round > 2) {
    return {
      result: 'rejected',
      newState: { ...state, round, brokerMood, open: true },
    };
  }

  // V2: Брокер ВСЕГДА соглашается (упрощённая механика для геймплея)
  // Принятие сразу если offer >= posted * 0.95 (даже чуть ниже posted)
  if (playerOffer >= Math.round(state.postedRate * 0.95) || round >= 2) {
    const agreedRate = playerOffer;
    return {
      result: 'accepted',
      newState: { ...state, round, brokerMood: 'happy', open: true },
      agreedRate,
    };
  }

  // V2: Контр-оффер ближе к игроку (60% от разницы вместо 40%)
  const counterOffer = Math.round(state.postedRate + (playerOffer - state.postedRate) * 0.6);

  return {
    result: 'counter',
    newState: {
      ...state,
      currentOffer: counterOffer,
      round,
      brokerMood,
      open: true,
    },
  };
}

/**
 * Генерирует текст ответа брокера (V2: расширенные ответы).
 */
export function getBrokerResponse(mood: BrokerMood, result: NegotiationResult, counterOffer?: number): string {
  if (result === 'accepted') {
    const responses = [
      "Deal! I'll send the Rate Con right away. Good doing business!",
      "Alright, we have a deal! Rate Con coming your way in 5 minutes.",
      "That works for me. Let me get the paperwork started. Rate Con incoming.",
      "You got it! I'll email the Rate Con now. Pickup is confirmed.",
      "Deal! Great rate for this lane. Sending Rate Confirmation now.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (result === 'rejected') {
    const responses = [
      "Sorry man, that's way too high for this load. I'll find another carrier. Good luck!",
      "I appreciate your time, but I can't go that high. Maybe next time we can work together.",
      "That's above my budget on this one. I have other options lined up. Thanks anyway!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Counter offer — расширенные ответы по настроению
  const moodResponses: Record<BrokerMood, string[]> = {
    happy: [
      `I like working with you! Best I can do is $${counterOffer?.toLocaleString()}. That's a fair rate for this lane.`,
      `Good offer! How about we meet in the middle at $${counterOffer?.toLocaleString()}? I think that's fair for both of us.`,
      `I appreciate the professionalism. Let me bump it to $${counterOffer?.toLocaleString()} — that's competitive.`,
    ],
    neutral: [
      `I hear you. Let me check with my team... OK, I can go up to $${counterOffer?.toLocaleString()}. That's my best right now.`,
      `Hmm, that's a bit high for this lane. I can do $${counterOffer?.toLocaleString()} — that's above market for this route.`,
      `Let me see what I can do... I can bump it to $${counterOffer?.toLocaleString()}. What do you think?`,
    ],
    annoyed: [
      `Look, $${counterOffer?.toLocaleString()} is the absolute max I can do. My shipper won't approve more than that.`,
      `I'm trying to work with you here. $${counterOffer?.toLocaleString()} — take it or leave it. I have other carriers calling.`,
      `That's too high. $${counterOffer?.toLocaleString()} is my final number. I need an answer now.`,
    ],
    angry: [
      `$${counterOffer?.toLocaleString()}. That's it. I'm not going higher. Yes or no?`,
      `I have 3 other carriers at this rate. $${counterOffer?.toLocaleString()} — last chance.`,
    ],
  };

  const options = moodResponses[mood];
  return options[Math.floor(Math.random() * options.length)];
}
