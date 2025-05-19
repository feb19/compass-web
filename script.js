const target = { lat: 34.77804336035684, lng: 135.38355739973917 };
let currentLat = null, currentLng = null;

function toRad(deg) {
  return deg * Math.PI / 180;
}

function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(2);
}

navigator.geolocation.watchPosition(pos => {
  currentLat = pos.coords.latitude;
  currentLng = pos.coords.longitude;

  document.getElementById("location").textContent =
    `現在地: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`;

  const distance = getDistance(currentLat, currentLng, target.lat, target.lng);
  document.getElementById("distance").textContent = `距離: ${distance} km`;
});

function updateArrow(heading) {
  if (currentLat === null || currentLng === null) return;
  const bearing = getBearing(currentLat, currentLng, target.lat, target.lng);
  const diff = (bearing - heading + 360) % 360;
  document.getElementById("arrow").style.transform = `translate(-50%, -50%) rotate(${diff}deg)`;
}

// iOS 対策
if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function') {
  document.getElementById("requestPermission").style.display = 'block';
  document.getElementById("requestPermission").onclick = () => {
    DeviceOrientationEvent.requestPermission().then(response => {
      if (response === 'granted') {
        window.addEventListener('deviceorientationabsolute', e => updateArrow(e.alpha));
      }
    });
  };
} else {
  window.addEventListener('deviceorientationabsolute', e => updateArrow(e.alpha));
}
