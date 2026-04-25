import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemeColors } from '../constants/themes';
import { SERVICE_VEHICLE_CONFIGS, ServiceVehicleType } from '../types/serviceVehicle';
import { useMemo } from 'react';

interface Props {
  visible: boolean;
  truckName: string;
  truckPosition: [number, number];
  onClose: () => void;
  onSelect: (serviceType: ServiceVehicleType) => void;
}

export default function ServiceChoiceModal({ visible, truckName, truckPosition, onClose, onSelect }: Props) {
  const T = useTheme();
  const s = useMemo(() => makeStyles(T), [T]);

  // Импортируем хелперы для расчёта стоимости
  const { findNearestCity, calculateDistance, calculateServiceCost, calculateServiceETA } = require('../utils/serviceVehicleHelpers');
  const { CITIES } = require('../constants/config');

  // Находим ближайший город и рассчитываем стоимость для каждого типа
  const nearestCity = findNearestCity(truckPosition);
  const cityPosition = CITIES[nearestCity];
  const distance = cityPosition ? calculateDistance(
    cityPosition[0], cityPosition[1],
    truckPosition[0], truckPosition[1]
  ) : 0;

  const gameHour = 12; // Используем дневное время для расчёта (можно улучшить)

  const services: Array<{
    type: ServiceVehicleType;
    icon: string;
    label: string;
    description: string;
    cost: number;
    eta: number;
    repairTime: number;
    color: string;
    recommended?: boolean;
  }> = [
    {
      type: 'roadside_assist',
      icon: '🚗',
      label: 'Road Assist',
      description: 'Quick roadside repair',
      cost: calculateServiceCost(distance, 'roadside_assist', gameHour),
      eta: calculateServiceETA(distance, 'roadside_assist'),
      repairTime: SERVICE_VEHICLE_CONFIGS.roadside_assist.repairDuration,
      color: '#06b6d4',
      recommended: true,
    },
    {
      type: 'mobile_mechanic',
      icon: '🔧',
      label: 'Mobile Mechanic',
      description: 'Professional mobile repair',
      cost: calculateServiceCost(distance, 'mobile_mechanic', gameHour),
      eta: calculateServiceETA(distance, 'mobile_mechanic'),
      repairTime: SERVICE_VEHICLE_CONFIGS.mobile_mechanic.repairDuration,
      color: '#8b5cf6',
    },
    {
      type: 'tow_truck',
      icon: '🚛',
      label: 'Tow Truck',
      description: 'Tow to nearest repair shop',
      cost: calculateServiceCost(distance, 'tow_truck', gameHour),
      eta: calculateServiceETA(distance, 'tow_truck'),
      repairTime: SERVICE_VEHICLE_CONFIGS.tow_truck.repairDuration,
      color: '#f59e0b',
    },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.modal} activeOpacity={1} onPress={e => e.stopPropagation()}>
          
          {/* Header */}
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>🚨 Call Service</Text>
              <Text style={s.subtitle}>{truckName} — {nearestCity}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Distance Info */}
          <View style={s.infoCard}>
            <Text style={s.infoIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>Nearest Service</Text>
              <Text style={s.infoValue}>{nearestCity} · {Math.round(distance)} miles</Text>
            </View>
          </View>

          {/* Service Options */}
          <View style={s.servicesContainer}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.type}
                style={[
                  s.serviceCard,
                  { borderColor: service.color + '44', backgroundColor: service.color + '0a' },
                  service.recommended && s.serviceCardRecommended,
                ]}
                onPress={() => onSelect(service.type)}
                activeOpacity={0.8}
              >
                {service.recommended && (
                  <View style={[s.recommendedBadge, { backgroundColor: service.color }]}>
                    <Text style={s.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}

                <View style={s.serviceHeader}>
                  <Text style={s.serviceIcon}>{service.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.serviceLabel, { color: service.color }]}>{service.label}</Text>
                    <Text style={s.serviceDescription}>{service.description}</Text>
                  </View>
                </View>

                <View style={s.serviceStats}>
                  <View style={s.serviceStat}>
                    <Text style={s.serviceStatLabel}>Cost</Text>
                    <Text style={[s.serviceStatValue, { color: service.color }]}>
                      ${service.cost.toLocaleString()}
                    </Text>
                  </View>
                  <View style={s.serviceStat}>
                    <Text style={s.serviceStatLabel}>ETA</Text>
                    <Text style={[s.serviceStatValue, { color: service.color }]}>
                      {service.eta < 60 ? `${service.eta}min` : `${Math.floor(service.eta / 60)}h ${service.eta % 60}m`}
                    </Text>
                  </View>
                  <View style={s.serviceStat}>
                    <Text style={s.serviceStatLabel}>Repair</Text>
                    <Text style={[s.serviceStatValue, { color: service.color }]}>
                      {service.repairTime}min
                    </Text>
                  </View>
                </View>

                <View style={[s.selectBtn, { backgroundColor: service.color + '20', borderColor: service.color + '55' }]}>
                  <Text style={[s.selectBtnText, { color: service.color }]}>
                    Select {service.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function makeStyles(T: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modal: {
      backgroundColor: T.bgCard,
      borderRadius: 20,
      width: '100%',
      maxWidth: 480,
      maxHeight: '90%',
      borderWidth: 1.5,
      borderColor: 'rgba(6,182,212,0.35)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: T.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: '#ef4444',
    },
    subtitle: {
      fontSize: 13,
      color: T.textSecondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: T.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      fontSize: 16,
      color: T.textSecondary,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      margin: 16,
      marginBottom: 8,
      padding: 12,
      backgroundColor: 'rgba(6,182,212,0.08)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(6,182,212,0.25)',
    },
    infoIcon: {
      fontSize: 24,
    },
    infoLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: T.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '800',
      color: '#06b6d4',
      marginTop: 2,
    },
    servicesContainer: {
      padding: 16,
      paddingTop: 8,
      gap: 12,
    },
    serviceCard: {
      borderRadius: 16,
      borderWidth: 2,
      padding: 14,
      gap: 12,
      position: 'relative',
    },
    serviceCardRecommended: {
      borderWidth: 2.5,
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    recommendedBadge: {
      position: 'absolute',
      top: -8,
      right: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    recommendedText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: 0.5,
    },
    serviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    serviceIcon: {
      fontSize: 32,
    },
    serviceLabel: {
      fontSize: 16,
      fontWeight: '900',
    },
    serviceDescription: {
      fontSize: 12,
      color: T.textSecondary,
      marginTop: 2,
    },
    serviceStats: {
      flexDirection: 'row',
      gap: 12,
    },
    serviceStat: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
      backgroundColor: T.border,
      borderRadius: 10,
    },
    serviceStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: T.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    serviceStatValue: {
      fontSize: 14,
      fontWeight: '900',
      marginTop: 2,
    },
    selectBtn: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
    },
    selectBtnText: {
      fontSize: 14,
      fontWeight: '900',
    },
    cancelBtn: {
      margin: 16,
      marginTop: 0,
      padding: 14,
      borderRadius: 12,
      backgroundColor: T.border,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: T.textSecondary,
    },
  });
}
