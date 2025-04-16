import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Location = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

const App = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('always');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  };

  const getAndStoreLocation = async () => {
    Geolocation.getCurrentPosition(
      async position => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        };

        const prevData = await AsyncStorage.getItem('location_logs');
        const updated = [
          ...(prevData ? JSON.parse(prevData) : []),
          newLocation,
        ];

        await AsyncStorage.setItem('location_logs', JSON.stringify(updated));
        setLocations(updated);
      },
      error => {
        console.warn('위치 오류:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  };

  const loadStoredLocations = async () => {
    const stored = await AsyncStorage.getItem('location_logs');
    if (stored) {
      setLocations(JSON.parse(stored));
    }
  };

  useEffect(() => {
    requestPermission().then(granted => {
      if (granted) {
        loadStoredLocations();

        intervalRef.current = setInterval(() => {
          getAndStoreLocation();
        }, 1000);
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📍 위치 추적 로그</Text>
      {locations.map((loc, index) => (
        <Text key={index} style={styles.log}>
          {index + 1}. [{formatTimestamp(loc.timestamp)}] 위도:{' '}
          {loc.latitude.toFixed(6)}, 경도: {loc.longitude.toFixed(6)}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  log: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default App;
