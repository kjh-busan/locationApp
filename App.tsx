import React, {useEffect, useState} from 'react';
import {View, Text, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // useEffect(() => {
  //   const requestLocationPermission = async () => {
  //     if (Platform.OS === 'ios') {
  //       getLocation();
  //     } else {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         getLocation();
  //       } else {
  //         console.log('위치 권한 거부됨');
  //       }
  //     }
  //   };

  //   const getLocation = () => {
  //     Geolocation.getCurrentPosition(
  //       position => {
  //         setLocation(position.coords);
  //       },
  //       error => {
  //         console.error(error);
  //       },
  //       {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
  //     );
  //   };

  //   requestLocationPermission();
  // }, []);

  useEffect(() => {
    const requestPermission = async () => {
      const result = await Geolocation.requestAuthorization('whenInUse');
      console.log('권한 요청 결과:', result); // granted, denied, etc.
      if (result === 'granted') {
        getLocation();
      } else {
        console.warn('위치 권한 거부됨');
      }
    };

    const getLocation = () => {
      Geolocation.getCurrentPosition(
        pos => setLocation(pos.coords),
        err => console.error(err),
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    };

    requestPermission();
    console.log('location:', location);
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Hello location 김주환</Text>
      <Text>위도: {location?.latitude}</Text>
      <Text>경도: {location?.longitude}</Text>
    </View>
  );
};

export default App;
