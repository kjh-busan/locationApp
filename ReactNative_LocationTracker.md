# 📱 React Native 위치 추적 앱 개발 정리

---

## ✅ 목표 기능

- 1초마다 **실시간 위치 추적**
- 위치를 **시간(YYYY-MM-DD HH:mm:ss)** 과 함께 화면에 누적 표시
- 현재 위치를 **지도에 마커로 표시**
- 백그라운드에서도 위치 추적 가능 여부 확인
- 위치 정보 서버 전송 기능 (기본 fetch 사용)

---

## 📦 주요 사용 라이브러리

| 라이브러리 | 설명 |
|------------|------|
| `react-native-geolocation-service` | 고정확도 위치 추적 라이브러리 |
| `@react-native-async-storage/async-storage` | 위치 로그 저장용 |
| `react-native-maps` | 지도 표시 및 마커 표시 |

---

## 🔧 설치 명령어

```bash
npm install react-native-geolocation-service
npm install @react-native-async-storage/async-storage
npm install react-native-maps
npx pod-install ios
```

---

## 🛠 iOS 권한 설정 (`ios/LocationApp/Info.plist`)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>앱이 실행 중일 때 위치 정보를 사용합니다.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>앱이 항상 위치를 사용할 수 있도록 허용해주세요.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>앱이 백그라운드에서도 위치를 사용할 수 있도록 허용해주세요.</string>
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
</array>
```

---

## 🧑‍💻 `App.tsx` 전체 코드 (1초마다 추적 + 화면 표시 + 지도)

```tsx
<-- 코드 생략: 동일한 내용 -->
```

---

## 🌐 서버 전송 추가 예시 (`fetch` 사용)

```ts
await fetch('https://your-api.example.com/location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude,
    longitude,
    timestamp,
  }),
});
```

---

## 🧪 백그라운드 테스트 체크리스트 (iOS)

- [x] 위치 권한 → "항상 허용"
- [x] `Info.plist` 설정 완료 (`UIBackgroundModes: location`)
- [x] 앱 실행 후 홈 화면으로 이동
- [x] Xcode 또는 `npx react-native log-ios`로 로그 확인

> ❗ JS는 백그라운드에서 정지되므로 실제 지속 추적은 **네이티브 모듈**이 필요

---

## 📚 다음 확장 가능 기능

- `react-native-background-geolocation`으로 백그라운드 완전 대응
- 서버 저장 → DB 기록
- 위치 기반 알림 (지오펜싱)
- 위치를 파일로 저장 (예: CSV, 로그 등)