import React, {useEffect, useState} from 'react';
import {
  View,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';

const SERVER_URL = 'https://your-api.example.com/location'; // ✅ 실제 서버 주소로 교체

const App = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null>(null);

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

  const getAndSendLocation = () => {
    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        const timestamp = pos.timestamp;
        setLocation({latitude, longitude, timestamp});

        // 서버로 전송
        try {
          await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude,
              longitude,
              timestamp,
            }),
          });
          console.log('📤 위치 전송 완료');
        } catch (err) {
          console.error('❌ 서버 전송 실패:', err);
        }
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

  useEffect(() => {
    requestPermission().then(granted => {
      if (granted) {
        getAndSendLocation();

        // 1초마다 위치 전송
        const interval = setInterval(getAndSendLocation, 1000);
        return () => clearInterval(interval);
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}>
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="현재 위치"
            description={`시간: ${new Date(
              location.timestamp,
            ).toLocaleTimeString()}`}
          />
        </MapView>
      ) : (
        <Text style={styles.text}>위치 가져오는 중...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  text: {
    marginTop: 100,
    textAlign: 'center',
  },
});

export default App;
