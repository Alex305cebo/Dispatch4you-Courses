/**
 * Единый источник изображений траков.
 * Через require() Metro сам бандлит ассеты и выдаёт корректный URL в dev и в проде
 * (под любым base-путём) — без ручных путей вида '/game/assets/Truck_Pic', которые
 * ломались из-за рассинхрона имён папок (Truck_Pic / Truck Pic / TruckPic).
 */
import type { ImageSourcePropType } from 'react-native';

const TRUCK_IMAGES: Record<number, ImageSourcePropType> = {
  1: require('../assets/Truck_Pic/1.webp'),
  2: require('../assets/Truck_Pic/2.webp'),
  3: require('../assets/Truck_Pic/3.webp'),
  4: require('../assets/Truck_Pic/4.webp'),
  5: require('../assets/Truck_Pic/5.webp'),
  6: require('../assets/Truck_Pic/6.webp'),
  7: require('../assets/Truck_Pic/7.webp'),
  8: require('../assets/Truck_Pic/8.webp'),
  9: require('../assets/Truck_Pic/9.webp'),
  10: require('../assets/Truck_Pic/10.webp'),
  11: require('../assets/Truck_Pic/11.webp'),
};

/** Картинка трака по id лота (1–11). Возвращает undefined для неизвестного id. */
export function getTruckImage(id: number): ImageSourcePropType | undefined {
  return TRUCK_IMAGES[id];
}
