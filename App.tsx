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
import MapView, {Marker} from 'react-native-maps';

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

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`;
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const newLoc: Location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: pos.timestamp,
        };
        setLocations(prev => [...prev, newLoc]);
      },
      err => {
        console.warn('위치 오류:', err.message);
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

  useEffect(() => {
    requestPermission().then(granted => {
      if (granted) {
        getLocation(); // 최초 1회
        intervalRef.current = setInterval(() => {
          getLocation();
        }, 1000);
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const lastLocation = locations[locations.length - 1];

  return (
    <View style={styles.container}>
      {lastLocation ? (
        <MapView
          style={styles.map}
          region={{
            latitude: lastLocation.latitude,
            longitude: lastLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}>
          <Marker
            coordinate={{
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
            }}
            title="현재 위치"
            description={`시간: ${formatTime(lastLocation.timestamp)}`}
          />
        </MapView>
      ) : (
        <Text style={styles.loading}>지도 불러오는 중...</Text>
      )}
      <ScrollView style={styles.logBox}>
        {locations.map((loc, idx) => (
          <Text key={idx} style={styles.logText}>
            {idx + 1}. [{formatTime(loc.timestamp)}] 위도:{' '}
            {loc.latitude.toFixed(6)}, 경도: {loc.longitude.toFixed(6)}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  map: {flex: 1},
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: 16,
  },
  logBox: {
    backgroundColor: '#fff',
    padding: 10,
    maxHeight: 200,
  },
  logText: {
    fontSize: 13,
    marginBottom: 4,
  },
});

export default App;
