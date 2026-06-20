import { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const SITE_URL = 'https://dispatch4you.com/';
const LOAD_TIMEOUT_MS = 15000; // 15 seconds timeout

export default function AppScreen() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start timeout when loading begins
  const startTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setTimedOut(true);
      }
    }, LOAD_TIMEOUT_MS);
  }, [loading]);

  // Clear timeout when loading ends
  useEffect(() => {
    if (!loading && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      setTimedOut(false);
    }
  }, [loading]);

  // Start timeout on mount
  useEffect(() => {
    startTimeout();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Android back button — navigate back in WebView instead of closing app
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [canGoBack]);

  const handleRetry = () => {
    setError(false);
    setTimedOut(false);
    setLoading(true);
    startTimeout();
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📡</Text>
        <Text style={styles.errorTitle}>Нет подключения</Text>
        <Text style={styles.errorText}>
          Проверьте интернет-соединение и попробуйте снова
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <Text style={styles.retryText}>🔄 Повторить</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: SITE_URL }}
        style={styles.webview}
        // Performance
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        // Cache
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // Allow media autoplay (video background in game)
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // Allow Google Sign-In popups
        javaScriptCanOpenWindowsAutomatically={true}
        // Mixed content (http images on https page)
        mixedContentMode="compatibility"
        // Navigation state
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        // Loading events
        onLoadStart={() => {
          setLoading(true);
          startTimeout();
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setError(true);
          }
        }}
        // User agent to identify app traffic
        applicationNameForUserAgent="Dispatch4You-App/3.3.0"
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingIcon}>🚛</Text>
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text style={styles.loadingText}>
            {timedOut ? 'Загрузка идёт медленно...' : 'Загрузка...'}
          </Text>
          {timedOut && (
            <TouchableOpacity style={styles.retryBtnSmall} onPress={handleRetry}>
              <Text style={styles.retryTextSmall}>🔄 Перезагрузить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0f1e',
  },
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f1e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingIcon: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  retryBtnSmall: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(6,182,212,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    borderRadius: 10,
  },
  retryTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
  },
  // Error
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  errorIcon: {
    fontSize: 56,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.4)',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06b6d4',
  },
});
