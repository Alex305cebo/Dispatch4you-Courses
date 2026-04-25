import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на новое главное меню
    const timer = setTimeout(() => {
      router.replace('/menu');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#0a0e27', '#1a1f3a', '#0f1729']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={s.loader}>
        <Text style={s.loaderIcon}>🚛</Text>
        <Text style={s.loaderText}>Загрузка...</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    alignItems: 'center',
    gap: 16,
  },
  loaderIcon: {
    fontSize: 48,
  },
  loaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
  },
});
