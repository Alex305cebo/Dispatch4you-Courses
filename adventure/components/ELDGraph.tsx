import { View, Text, StyleSheet } from 'react-native';

interface ELDPoint {
  hour: number;
  status: 'OFF' | 'SB' | 'D' | 'ON';
}

interface Props {
  hoursWorked: number;
  currentStatus: 'idle' | 'driving' | 'at_pickup' | 'loaded' | 'at_delivery' | 'breakdown' | 'waiting';
}

export default function ELDGraph({ hoursWorked, currentStatus }: Props) {
  // Генерируем данные для графика (упрощенная версия)
  const generateELDData = (): ELDPoint[] => {
    const points: ELDPoint[] = [];
    
    // Пример: N-3 = OFF, 3-5 = D, 5-10 = D, 10-11 = OFF, 11-N = SB, N-3 = D, 3-4 = ON, 4-N = OFF
    points.push({ hour: 0, status: 'OFF' });
    points.push({ hour: 3, status: 'OFF' });
    points.push({ hour: 3, status: 'D' });
    points.push({ hour: 10, status: 'D' });
    points.push({ hour: 10, status: 'OFF' });
    points.push({ hour: 11, status: 'OFF' });
    points.push({ hour: 11, status: 'SB' });
    points.push({ hour: 12, status: 'SB' });
    points.push({ hour: 12, status: 'D' });
    points.push({ hour: 15, status: 'D' });
    points.push({ hour: 15, status: 'ON' });
    points.push({ hour: 16, status: 'ON' });
    points.push({ hour: 16, status: 'OFF' });
    points.push({ hour: 24, status: 'OFF' });
    
    return points;
  };

  const eldData = generateELDData();

  // Координаты Y для каждого статуса
  const getY = (status: 'OFF' | 'SB' | 'D' | 'ON'): number => {
    const yMap = {
      'OFF': 12.5,  // верхняя зона
      'SB': 37.5,   // вторая зона
      'D': 62.5,    // третья зона
      'ON': 87.5,   // нижняя зона
    };
    return yMap[status];
  };

  // Подсчет оставшихся часов для каждого статуса
  const calculateRemaining = () => {
    let offHours = 0, sbHours = 0, dHours = 0, onHours = 0;
    
    for (let i = 1; i < eldData.length; i++) {
      const duration = eldData[i].hour - eldData[i - 1].hour;
      const status = eldData[i - 1].status;
      
      if (status === 'OFF') offHours += duration;
      else if (status === 'SB') sbHours += duration;
      else if (status === 'D') dHours += duration;
      else if (status === 'ON') onHours += duration;
    }
    
    return { offHours, sbHours, dHours, onHours };
  };

  const remaining = calculateRemaining();

  return (
    <View style={styles.container}>
      {/* Левая шкала */}
      <View style={styles.labels}>
        <Text style={styles.label}>OFF</Text>
        <Text style={styles.label}>SB</Text>
        <Text style={styles.label}>D</Text>
        <Text style={styles.label}>ON</Text>
      </View>

      {/* График */}
      <View style={styles.graph}>
        {/* Фон белый */}
        <View style={styles.background} />

        {/* Горизонтальные линии (границы зон) */}
        <View style={styles.horizontalLines}>
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
        </View>

        {/* Вертикальные линии (сетка часов) */}
        <View style={styles.verticalLines}>
          {Array.from({ length: 25 }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.verticalLine,
                (i === 0 || i === 12 || i === 24) && styles.verticalLineBold
              ]} 
            />
          ))}
        </View>

        {/* Синяя линия статусов */}
        <View style={styles.statusLine}>
          {eldData.map((point, i) => {
            if (i === 0) return null;
            
            const prevPoint = eldData[i - 1];
            const x1 = (prevPoint.hour / 24) * 100;
            const x2 = (point.hour / 24) * 100;
            const y1 = getY(prevPoint.status);
            const y2 = getY(point.status);

            return (
              <View key={i}>
                {/* Горизонтальная линия */}
                <View style={{
                  position: 'absolute',
                  left: `${x1}%`,
                  top: `${y1}%`,
                  width: `${x2 - x1}%`,
                  height: 2,
                  backgroundColor: '#3b82f6',
                  marginTop: -1,
                }} />

                {/* Вертикальная линия при смене статуса */}
                {y1 !== y2 && (
                  <View style={{
                    position: 'absolute',
                    left: `${x2}%`,
                    top: `${Math.min(y1, y2)}%`,
                    width: 2,
                    height: `${Math.abs(y2 - y1)}%`,
                    backgroundColor: '#3b82f6',
                    marginLeft: -1,
                  }} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Правая панель с оставшимися часами */}
      <View style={styles.rightPanel}>
        <View style={styles.timeRow}>
          <Text style={styles.timeValue}>{remaining.offHours}h{Math.round((remaining.offHours % 1) * 60)}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeValue}>{remaining.sbHours}h{Math.round((remaining.sbHours % 1) * 60)}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeValue}>{remaining.dHours}h{Math.round((remaining.dHours % 1) * 60)}</Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeValue}>{remaining.onHours}h{Math.round((remaining.onHours % 1) * 60)}</Text>
        </View>
        <Text style={styles.totalTime}>24h00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
    marginBottom: 12,
  },
  labels: {
    width: 40,
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRightWidth: 1,
    borderRightColor: '#cbd5e1',
  },
  label: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
  },
  graph: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  horizontalLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#94a3b8',
  },
  verticalLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#cbd5e1',
  },
  verticalLineBold: {
    backgroundColor: '#64748b',
  },
  statusLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  rightPanel: {
    width: 50,
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 1,
    borderLeftColor: '#cbd5e1',
  },
  timeRow: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  totalTime: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});

