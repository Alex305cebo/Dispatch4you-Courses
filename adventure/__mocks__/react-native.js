// Минимальный мок React Native для unit-тестов
module.exports = {
  Platform: { OS: 'web', select: (obj) => obj.web ?? obj.default },
  StyleSheet: { create: (s) => s },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  useWindowDimensions: () => ({ width: 1200, height: 800 }),
};
