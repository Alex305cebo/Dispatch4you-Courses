import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, useWindowDimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import { cityState, CITY_STATE } from '../constants/config';
import { useGameStore, Truck, TruckStatus } from '../store/gameStore';
import TruckDetailModal from './TruckDetailModal';

interface TruckPanelProps {
  onSwitchToLoadBoard?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен', driving: 'К погрузке', at_pickup: 'Погрузка',
  loaded: 'В пути', at_delivery: 'Разгрузка',
  breakdown: 'Поломка', waiting: 'Detention', in_garage: 'В гараже',
};
const STATUS_COLOR: Record<string, string> = {
  idle: '#38bdf8', driving: '#818cf8', at_pickup: '#fbbf24',
  loaded: '#4ade80', at_delivery: '#a78bfa',
  breakdown: '#f87171', waiting: '#fb923c', in_garage: '#f59e0b',
};
const STATUS_ICON: Record<string, string> = {
  idle: '⚪', driving: '🔵', at_pickup: '🟡', loaded: '🟢',
  at_delivery: '🟣', breakdown: '🔴', waiting: '🟠', in_garage: '🔧',
};

const getTruckImageUri = (id: number): string => {
  const isGame = typeof window !== 'undefined' && window.location.pathname.startsWith('/game');
  return `${isGame ? '/game' : ''}/assets/Truck_Pic/${id}.webp`;
};

export default function TruckPanel({ onSwitchToLoadBoard }: TruckPanelProps = {}) {
  const T = useTheme();
  const { trucks, selectedTruckId, selectTruck, setLoadBoardSearch, balance } = useGameStore();
  const [detailTruck, setDetailTruck] = useState<Truck | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'issue'>('all');
  const { width } = useWindowDimensions();

  const idleCount = trucks.filter(t => t.status === 'idle').length;
  const activeCount = trucks.filter(t => ['driving', 'loaded', 'at_pickup', 'at_delivery'].includes(t.status)).length;
  const issueCount = trucks.filter(t => ['breakdown', 'waiting', 'in_garage'].includes(t.status)).length;

  const filtered = trucks.filter(t => {
    if (filter === 'idle') return t.status === 'idle';
    if (filter === 'active') return ['driving', 'loaded', 'at_pickup', 'at_delivery'].includes(t.status);
    if (filter === 'issue') return ['breakdown', 'waiting', 'in_garage'].includes(t.status);
    return true;
  });

  const totalRevenue = trucks.reduce((s, t) => s + (t.currentLoad?.agreedRate || 0), 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 10, gap: 8 }}>

      {/* ── HEADER ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '900', color: T.text }}>🚛 Флот</Text>
          <Text style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{trucks.length} траков · ${balance.toLocaleString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <View style={{ backgroundColor: 'rgba(74,222,128,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' }}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#4ade80' }}>💰 ${totalRevenue.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* ── FILTER CHIPS ── */}
      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 2 }}>
        {([
          { key: 'all', label: `Все ${trucks.length}`, color: '#94a3b8' },
          { key: 'active', label: `В пути ${activeCount}`, color: '#4ade80' },
          { key: 'idle', label: `Свободны ${idleCount}`, color: '#38bdf8' },
          { key: 'issue', label: `Проблемы ${issueCount}`, color: '#f87171' },
        ] as const).map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={{
              paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
              backgroundColor: filter === f.key ? f.color + '20' : 'rgba(255,255,255,0.03)',
              borderWidth: 1.5,
              borderColor: filter === f.key ? f.color + '55' : 'rgba(255,255,255,0.06)',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: filter === f.key ? f.color : T.textMuted }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TRUCK CARDS ── */}
      {filtered.map(truck => {
        const color = STATUS_COLOR[truck.status] || '#94a3b8';
        const label = (truck as any).onNightStop ? '🌙 Ночёвка'
          : (truck as any).hosRestUntilMinute > 0 ? '😴 HOS отдых'
          : `${STATUS_ICON[truck.status] || '⚪'} ${STATUS_LABEL[truck.status] || truck.status}`;
        const isSelected = selectedTruckId === truck.id;
        const hos = Math.max(0, truck.hoursLeft);
        const hosColor = hos < 2 ? '#f87171' : hos < 4 ? '#fbbf24' : '#4ade80';
        const mood = truck.mood ?? 75;
        const moodColor = mood >= 70 ? '#4ade80' : mood >= 40 ? '#fbbf24' : '#f87171';
        const progress = Math.round(truck.progress * 100);
        const isMoving = truck.status === 'driving' || truck.status === 'loaded';
        const imgId = (truck as any).truckImageId;
        const fromSt = CITY_STATE[truck.currentCity] || '';
        const toSt = truck.destinationCity ? (CITY_STATE[truck.destinationCity] || '') : '';
        const load = truck.currentLoad;

        return (
          <TouchableOpacity
            key={truck.id}
            onPress={() => selectTruck(isSelected ? null : truck.id)}
            activeOpacity={0.85}
            style={{
              backgroundColor: isSelected ? color + '0A' : T.bgCard,
              borderRadius: 14, borderWidth: 2,
              borderColor: isSelected ? color : 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Top row: avatar + info + status */}
            <View style={{ flexDirection: 'row', padding: 10, gap: 10 }}>
              {/* Avatar */}
              <View style={{
                width: 48, height: 48, borderRadius: 12, overflow: 'hidden',
                backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: color + '33',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {imgId ? (
                  <Image source={{ uri: getTruckImageUri(imgId) }} style={{ width: 48, height: 48 } as any} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 24 }}>{truck.status === 'breakdown' ? '🚨' : '🚛'}</Text>
                )}
              </View>

              {/* Info */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: T.text }} numberOfLines={1}>{truck.name}</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: color + '15', borderWidth: 1, borderColor: color + '44' }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color }}>{label}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
                  👤 {truck.driver} · 📍 {truck.currentCity}{fromSt ? `, ${fromSt}` : ''}
                </Text>

                {/* Route */}
                {truck.destinationCity && (
                  <Text style={{ fontSize: 10, fontWeight: '700', color: T.textSecondary, marginTop: 3 }}>
                    → {truck.destinationCity}{toSt ? `, ${toSt}` : ''}
                  </Text>
                )}
              </View>
            </View>

            {/* Progress bar */}
            {isMoving && !(truck as any).onNightStop && !((truck as any).hosRestUntilMinute > 0) && (
              <View style={{ paddingHorizontal: 10, paddingBottom: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 9, color: T.textMuted, fontWeight: '600' }}>Рейс</Text>
                  <Text style={{ fontSize: 9, fontWeight: '800', color }}>{progress}%</Text>
                </View>
                <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${progress}%` as any, backgroundColor: color, borderRadius: 2 }} />
                </View>
              </View>
            )}

            {/* Metrics row */}
            <View style={{
              flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingBottom: 8,
              borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)', paddingTop: 8,
            }}>
              {/* HOS */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: hosColor + '22' }}>
                <Text style={{ fontSize: 9, color: T.textMuted }}>⏱</Text>
                <Text style={{ fontSize: 12, fontWeight: '900', color: hosColor }}>{hos.toFixed(1)}</Text>
                <Text style={{ fontSize: 8, color: T.textMuted }}>HOS</Text>
              </View>
              {/* Mood */}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: moodColor + '22' }}>
                <Text style={{ fontSize: 9 }}>😊</Text>
                <Text style={{ fontSize: 12, fontWeight: '900', color: moodColor }}>{mood}%</Text>
              </View>
              {/* Rate */}
              {load ? (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(74,222,128,0.05)', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)' }}>
                  <Text style={{ fontSize: 9 }}>💰</Text>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#4ade80' }}>${load.agreedRate.toLocaleString()}</Text>
                </View>
              ) : (
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ fontSize: 9, color: T.textMuted }}>📭 Нет груза</Text>
                </View>
              )}
            </View>

            {/* Load info */}
            {load && (
              <View style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
                <View style={{ backgroundColor: 'rgba(6,182,212,0.06)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(6,182,212,0.15)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#06b6d4' }}>
                    📦 {load.commodity} · {load.equipment} · {load.miles} mi · ${(load.agreedRate / Math.max(1, load.miles)).toFixed(2)}/mi
                  </Text>
                </View>
              </View>
            )}

            {/* Actions — only when selected */}
            {isSelected && (
              <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingBottom: 10 }}>
                <TouchableOpacity
                  onPress={(e: any) => { e.stopPropagation(); setDetailTruck(truck); }}
                  style={{ flex: 1, backgroundColor: 'rgba(6,182,212,0.08)', borderWidth: 1.5, borderColor: 'rgba(6,182,212,0.25)', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#06b6d4' }}>📊 Аналитика</Text>
                </TouchableOpacity>
                {truck.status === 'idle' && (
                  <TouchableOpacity
                    onPress={(e: any) => {
                      e.stopPropagation();
                      setLoadBoardSearch(truck.currentCity);
                      onSwitchToLoadBoard?.();
                    }}
                    style={{ flex: 1, backgroundColor: 'rgba(74,222,128,0.08)', borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.25)', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#4ade80' }}>📦 Найти груз</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* ── SHOP BANNER ── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => useGameStore.getState().setTruckShopOpen(true)}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'rgba(245,158,11,0.06)', borderWidth: 1.5,
          borderColor: 'rgba(245,158,11,0.2)', borderRadius: 14, padding: 12, marginTop: 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Text style={{ fontSize: 24 }}>🏪</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fde68a' }}>Расширь флот!</Text>
            <Text style={{ fontSize: 10, color: T.textMuted }}>Б/У траки от $12,000</Text>
          </View>
        </View>
        <View style={{ backgroundColor: 'rgba(6,182,212,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(6,182,212,0.3)' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#06b6d4' }}>Магазин →</Text>
        </View>
      </TouchableOpacity>

      {/* Detail Modal */}
      <TruckDetailModal
        truck={detailTruck}
        onClose={() => setDetailTruck(null)}
        onFindLoad={(city) => {
          setLoadBoardSearch(city);
          setDetailTruck(null);
          onSwitchToLoadBoard?.();
        }}
      />
    </ScrollView>
  );
}
