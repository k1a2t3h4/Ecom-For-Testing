import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/mongodb';
import { products as sampleProducts } from '../../data/products';

// --- Review generation logic (from push-reviews.ts, adapted) ---
const deviceProfiles = [
  { platform: "web", deviceFingerprint: "WEB1234A", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", ipAddress: "192.168.1.10" },
  { platform: "web", deviceFingerprint: "WEB5678B", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15", ipAddress: "10.0.0.5" },
  { platform: "mobile", deviceFingerprint: "MOB1111C", userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", ipAddress: "172.16.0.2" },
  { platform: "mobile", deviceFingerprint: "MOB2222D", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1", ipAddress: "192.168.0.22" },
  { platform: "android_app", deviceFingerprint: "ANDR3333E", userAgent: "Dalvik/2.1.0 (Linux; U; Android 10; Redmi Note 8T Build/QKQ1.200114.002)", ipAddress: "203.0.113.5" },
  { platform: "android_app", deviceFingerprint: "ANDR4444F", userAgent: "Dalvik/2.1.0 (Linux; U; Android 12; Pixel 5 Build/SP1A.210812.015)", ipAddress: "198.51.100.23" },
  { platform: "ios_app", deviceFingerprint: "IOS5555G", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "203.0.113.45" },
  { platform: "ios_app", deviceFingerprint: "IOS6666H", userAgent: "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "198.51.100.99" },
  { platform: "web", deviceFingerprint: "WEB7777I", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", ipAddress: "10.1.1.1" },
  { platform: "mobile", deviceFingerprint: "MOB8888J", userAgent: "Mozilla/5.0 (Linux; Android 10; SM-A107F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36", ipAddress: "172.16.1.10" },
  { platform: "android_app", deviceFingerprint: "ANDR9999K", userAgent: "Dalvik/2.1.0 (Linux; U; Android 9; Mi A2 Build/PKQ1.180904.001)", ipAddress: "203.0.113.77" },
  { platform: "ios_app", deviceFingerprint: "IOS0000L", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148", ipAddress: "198.51.100.101" }
];
const users = Array.from({ length: 50 }).map((_, i) => {
  const id = (i + 1).toString().padStart(5, '0');
  const userDevices = getRandomSubset(deviceProfiles, 1, 3);
  return {
    userId: `USER_${id}`,
    name: `User ${id}`,
    profilePicUrl: `https://images.unsplash.com/photo-1612073584622-335da5fadd8a?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
    location: [
      'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India',
      'Kolkata, India', 'Pune, India', 'Ahmedabad, India', 'Jaipur, India', 'Lucknow, India',
      'Kanpur, India', 'Nagpur, India', 'Indore, India', 'Thane, India', 'Bhopal, India',
      'Visakhapatnam, India', 'Pimpri-Chinchwad, India', 'Patna, India', 'Vadodara, India', 'Ghaziabad, India',
      'Ludhiana, India', 'Agra, India', 'Nashik, India', 'Faridabad, India', 'Meerut, India',
      'Rajkot, India', 'Kalyan-Dombivli, India', 'Vasai-Virar, India', 'Varanasi, India', 'Srinagar, India',
      'Aurangabad, India', 'Dhanbad, India', 'Amritsar, India', 'Navi Mumbai, India', 'Allahabad, India',
      'Ranchi, India', 'Howrah, India', 'Coimbatore, India', 'Jabalpur, India', 'Gwalior, India',
      'Vijayawada, India', 'Jodhpur, India', 'Madurai, India', 'Raipur, India', 'Kota, India',
      'Guwahati, India', 'Chandigarh, India', 'Solapur, India', 'Hubli–Dharwad, India', 'Mysore, India'
    ][i],
    verifiedBuyer: Math.random() < 0.7,
    devices: userDevices
  };
});
const imageUrls = [
  "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1584998316204-3b1e3b1895ae?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489105008-063e31b2dbcd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1698264957344-b4ffacc69b6b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1615240945501-58d2563db9e1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1676145731619-23094f3f8895?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1565292334631-95d1dd9e2970?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1723277174725-90e2b1212f2e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1524255684952-d7185b509571?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1593380090147-a2192b72a9ae?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1657550853413-a646ba6a1877?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1585229593056-ddd606c911de?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618068291962-bb16bfca7f0f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1598554793905-075f7b355cd9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618333452884-5c8d211ed2ad?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489108204-9c36d713341f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1631812908376-b8a74b7b6d61?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489108809-143dbf921060?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617059322001-a61ce9551e08?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1708363390856-172663a263d1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",           
      "https://images.unsplash.com/photo-1616847220575-31b062a4cd05?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1613423755148-0ff5515d60be?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1602303894456-398ce544d90b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1708363390932-15e8a29c0f56?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1680423032397-68aee6a38243?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1639497350985-cddf9f433a45?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1590400516695-36708d3f964a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1576082866986-460d8f2ae4fe?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618244965061-1d27b208d6e8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://plus.unsplash.com/premium_photo-1675186049419-d48f4b28fe7c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhc2hpb258ZW58MHx8MHx8fDA%3D',
    "https://images.unsplash.com/photo-1694466464626-7bd06595cf2d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1594843665794-446ce915d840?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1733786462849-a2f2adad79b5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1636614597280-3dde89cbd6cc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1502096472573-eaac515392c6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1706166987870-539ffd8286e7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1706289835536-3aa7b81aa2fd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1726219836040-d9b7b8c0d46f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1620783770629-122b7f187703?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1711397996070-f3fd14f6b139?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1727513372271-26957738f010?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1521661978458-5a2bec6b6e09?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1511975634005-8f73acab9525?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1604533107302-d3adcc6b6d82?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959327377-8cb3f75ac03d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746958922488-28d0a72ec63c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699796990049-3406a9991baa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1666460811258-c7ceac639561?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1733786463247-e1e09600fc44?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1636614223954-db6a663293ef?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1594995846645-d58328c3ffa4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1706166987972-5c772443f29a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1641671668696-f5061907290f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1578116397592-7cf7eb77a677?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1673718423569-27ce5b3857c2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959354700-5ab3cb89b689?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1711397996179-bd4bd28c78e6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1707588521743-636355884c21?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1589894404892-7310b92ea7a2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959326980-4d28e10fc446?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746958960271-88c9db492c7a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746958934981-72f5a32b9f2b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746958993100-f65dd010ee78?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959327350-229babde0829?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699796990062-c7a064563fc2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699796990055-c866ac0aa6ef?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699796990179-c52a790030fa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1677742380014-e660caefef34?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1733786463192-ddf0b8830564?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1643180232906-6c9caa7cd76a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1631747207274-34bb74416713?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1503177757247-03a572161a63?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1503177657524-94eb8840a0f5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1706166987869-5482b5ad8dd5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1707485122968-56916bd2c464?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959354674-7a8ccaf651e2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1673718423886-ba603e698efd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1673718424091-5fb734062c05?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1673718423582-f3378102c0d7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1711397996073-c9a629ebc05b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1602781975725-cab34bd38d94?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1727542908464-789161b9bfe6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959023493-9c7ab3c10ee2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746958975330-64a5492e64c3?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1746959292253-fab7ecf38fb4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1641563786213-185d68345426?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1699796990063-ee34d2eef5e2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1695712551666-e0c354b1e6b9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D"
]
const videoUrls = [
  'https://cdn.pixabay.com/video/2022/09/04/130211-748134196_large.mp4',
  'https://cdn.pixabay.com/video/2015/10/16/1006-142621176_large.mp4',
  'https://cdn.pixabay.com/video/2024/03/29/206029_large.mp4',
  'https://cdn.pixabay.com/video/2017/05/29/9398-219552669_large.mp4',
  'https://cdn.pixabay.com/video/2024/09/13/231147_large.mp4'
]
const reviewSamples: any[] = [
  {
    title: "Great product but slightly tight",
    reviewText: "I loved the material and finish. Delivery was quick, but size was slightly tight. I'd recommend buying one size up.",
    pros: ["High quality fabric", "Delivered on time", "Eco-friendly packaging"],
    cons: ["Size runs small"]
  },
  {
    title: "Excellent value for money",
    reviewText: "The product exceeded my expectations for the price. Will definitely buy again.",
    pros: ["Affordable", "Good quality", "Fast shipping"],
    cons: []
  },
  {
    title: "Color not as shown",
    reviewText: "The color was a bit different from the pictures, but overall quality is good.",
    pros: ["Soft material", "Comfortable fit"],
    cons: ["Color mismatch"]
  },
  {
    title: "Perfect fit and comfortable",
    reviewText: "Fits perfectly and is very comfortable for daily wear.",
    pros: ["Perfect fit", "Comfortable", "Good stitching"],
    cons: []
  },
  {
    title: "Packaging could be better",
    reviewText: "Product is good but the packaging was damaged on arrival.",
    pros: ["Good product", "Quick delivery"],
    cons: ["Damaged packaging"]
  },
  {
    title: "Impressed with the quality",
    reviewText: "The quality is top-notch. Will recommend to friends.",
    pros: ["Premium feel", "Durable", "Looks great"],
    cons: []
  },
  {
    title: "Late delivery but good product",
    reviewText: "Product is as described but delivery took longer than expected.",
    pros: ["Good quality", "Nice design"],
    cons: ["Late delivery"]
  },
  {
    title: "Not true to size",
    reviewText: "The size chart is off. Order a size up for a better fit.",
    pros: ["Nice fabric", "Trendy look"],
    cons: ["Runs small"]
  },
  {
    title: "Great for gifting",
    reviewText: "Bought this as a gift and the recipient loved it!",
    pros: ["Gift-worthy", "Attractive packaging"],
    cons: []
  },
  {
    title: "Average experience",
    reviewText: "Product is okay for the price, but nothing exceptional.",
    pros: ["Affordable"],
    cons: ["Average quality"]
  },
  {
    title: "Superb customer service",
    reviewText: "Had an issue with my order but customer service resolved it quickly.",
    pros: ["Responsive support", "Quick resolution"],
    cons: []
  },
  {
    title: "Material feels cheap",
    reviewText: "The material is not as good as expected. Not sure if I'd buy again.",
    pros: ["Good fit"],
    cons: ["Cheap material"]
  },
  {
    title: "Stylish and trendy",
    reviewText: "Love the style and color. Got many compliments!",
    pros: ["Trendy", "Nice color", "Good fit"],
    cons: []
  },
  {
    title: "Disappointed with the stitching",
    reviewText: "Stitching started coming off after one wash.",
    pros: ["Nice design"],
    cons: ["Poor stitching"]
  },
  {
    title: "Perfect for summer",
    reviewText: "Lightweight and breathable. Perfect for hot weather.",
    pros: ["Breathable", "Lightweight"],
    cons: []
  },
  {
    title: "Not worth the price",
    reviewText: "Expected better quality for the price paid.",
    pros: ["Good packaging"],
    cons: ["Overpriced"]
  },
  {
    title: "Exceeded expectations",
    reviewText: "The product quality and delivery speed exceeded my expectations.",
    pros: ["High quality", "Fast delivery"],
    cons: []
  },
  {
    title: "Too loose for my liking",
    reviewText: "The fit is too loose. Would prefer a more tailored fit.",
    pros: ["Soft fabric"],
    cons: ["Loose fit"]
  },
  {
    title: "Eco-friendly packaging is a plus",
    reviewText: "Loved the eco-friendly packaging. Product is good too.",
    pros: ["Eco-friendly packaging", "Good product"],
    cons: []
  },
  {
    title: "Would not recommend",
    reviewText: "Not satisfied with the product. Would not recommend to others.",
    pros: [],
    cons: ["Poor quality", "Not as described"]
  }
];
const tagList: any[] = [
  "tight fit", "great quality", "eco packaging", "fast delivery", "runs small", "colorful", "soft fabric", "durable", "affordable", "stylish", "comfortable", "good stitching", "premium feel", "gift-worthy", "lightweight", "breathable", "trendy", "nice packaging", "responsive support", "easy returns"
];
const customerList: any[] = [
  { authorId: "USER_44321", authorName: "Priya R" },
  { authorId: "USER_99887", authorName: "Amit S" },
  { authorId: "USER_11223", authorName: "Neha K" },
  { authorId: "USER_33445", authorName: "Rahul M" },
  { authorId: "USER_55667", authorName: "Sneha T" },
  { authorId: "USER_77889", authorName: "Vikas P" },
  { authorId: "USER_99001", authorName: "Anjali D" },
  { authorId: "USER_22334", authorName: "Rohit G" },
  { authorId: "USER_44556", authorName: "Meera L" },
  { authorId: "USER_66778", authorName: "Karan J" },
  { authorId: "USER_88990", authorName: "Divya S" },
  { authorId: "USER_10112", authorName: "Suresh N" },
  { authorId: "USER_12132", authorName: "Pooja V" },
  { authorId: "USER_14152", authorName: "Arjun B" },
  { authorId: "USER_16172", authorName: "Ritu C" }
];
const moderatorList: any[] = Array.from({ length: 15 }).map((_, i) => ({
  authorId: `MOD_${1001 + i}`,
  authorName: `Moderator ${i + 1}`
}));
const replyTexts: any[] = [
  "Thank you for your kind review!",
  "We appreciate your feedback.",
  "Sorry to hear about the issue.",
  "We're glad you liked it!",
  "We'll work on improving this.",
  "Thanks for shopping with us!",
  "Your suggestion is noted.",
  "Please contact support for help.",
  "We're looking into this.",
  "Happy to help!",
  "Thanks for highlighting this.",
  "We'll pass this to our team.",
  "Hope to serve you again!",
  "We value your opinion.",
  "Let us know if you need anything else."
];
const moderatorIds: any[] = Array.from({ length: 15 }).map((_, i) => `MOD_${1001 + i}`);
const moderationComments: { positive: string[]; negative: string[] } = {
  positive: [
    "Minor edits for clarity",
    "Auto-approved, no issues",
    "Edited for grammar",
    "Helpful review, approved",
    "Approved after minor changes",
    "Clean content, visible to users",
    "No policy violations found",
    "Approved by moderator",
    "System auto-approved",
    "Reviewed and published"
  ],
  negative: [
    "Policy violation",
    "Spam detected",
    "Rejected due to poor content",
    "Hidden due to DMCA request",
    "Flagged for abusive language",
    "Rejected: not relevant",
    "Archived for statistics",
    "Rejected: duplicate content",
    "Hidden by moderator",
    "Rejected: fake review"
  ]
};
const statusOptions = ["approved", "pending", "rejected", "flagged", "hidden", "archived"];
function getRandomSubset(arr, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function randomStatus() {
  return statusOptions[Math.floor(Math.random() * statusOptions.length)];
}
function randomModerator() {
  return moderatorIds[Math.floor(Math.random() * moderatorIds.length)];
}
function randomModerationComment(status) {
  if (status === "approved" || status === "flagged") {
    return moderationComments.positive[Math.floor(Math.random() * moderationComments.positive.length)];
  } else if (["rejected", "hidden", "archived"].includes(status)) {
    return moderationComments.negative[Math.floor(Math.random() * moderationComments.negative.length)];
  }
  return null;
}
function randomModeration(reviewDate, status) {
  if (status === "pending") return null;
  const minDays = 1, maxDays = 3;
  const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const reviewedAt = new Date(new Date(reviewDate).getTime() + daysToAdd * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000));
  return {
    reviewedBy: randomModerator(),
    reviewedAt: reviewedAt.toISOString(),
    comments: randomModerationComment(status)
  };
}
function randomRatingObject() {
  const quality = Math.floor(Math.random() * 5) + 1;
  const valueForMoney = Math.floor(Math.random() * 5) + 1;
  const delivery = Math.floor(Math.random() * 5) + 1;
  const packaging = Math.floor(Math.random() * 5) + 1;
  const fit = Math.floor(Math.random() * 5) + 1;
  const avg = (quality + valueForMoney + delivery + packaging + fit) / 5;
  const overall = Math.round(avg * 2) / 2;
  return {
    overall,
    quality,
    valueForMoney,
    delivery,
    packaging,
    fit
  };
}
function getRandomTags() {
  return getRandomSubset(tagList, 0, 4);
}
function getRandomReplies(status, reviewedAt, reviewDate) {
  if (status !== "approved") return [];
  const replyCount = Math.floor(Math.random() * 21); // 0-20
  const replies: any[] = [];
  for (let i = 0; i < replyCount; i++) {
    const replyId = `R_${(i + 1).toString().padStart(3, '0')}`;
    const authorRole = getRandomSubset(["store_owner", "customer", "moderator", "system"], 1, 1)[0];
    let authorId = "", authorName = "";
    if (authorRole === "store_owner") {
      authorId = "USER_00000";
      authorName = "Store Owner";
    } else if (authorRole === "customer") {
      const cust = customerList[Math.floor(Math.random() * customerList.length)];
      authorId = cust.authorId;
      authorName = cust.authorName;
    } else if (authorRole === "moderator") {
      const mod = moderatorList[Math.floor(Math.random() * moderatorList.length)];
      authorId = mod.authorId;
      authorName = mod.authorName;
    } else if (authorRole === "system") {
      authorId = "SYSTEM";
      authorName = "System";
    }
    const text = replyTexts[Math.floor(Math.random() * replyTexts.length)];
    // Date: random after reviewedAt (or reviewDate if no moderation)
    const baseDate = reviewedAt ? new Date(reviewedAt) : new Date(reviewDate);
    const replyDate = new Date(baseDate.getTime() + (Math.floor(Math.random() * 3) + 1) * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000));
    replies.push({
      replyId,
      authorId,
      authorRole,
      authorName,
      text,
      date: replyDate.toISOString()
    });
  }
  return replies;
}
function randomOrderId() {
  return `orderId_${Math.floor(100000 + Math.random() * 900000)}`;
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}
// --- End review logic ---

function randomProductCreatedAt() {
  const start = new Date('2024-01-01T00:00:00.000Z').getTime();
  const end = Date.now();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}
function randomPurchaseDateAfterProductCreatedAt(productCreatedAt: string) {
  const start = new Date(productCreatedAt).getTime();
  const end = Date.now();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}
function randomDeliveryTimeAfterPurchase(purchaseDate: Date) {
  const minDays = 4, maxDays = 8;
  const deliveryTime = purchaseDate.getTime() + (Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays) * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000);
  return new Date(deliveryTime);
}
function randomReviewDateAfterDelivery(deliveryTime: Date) {
  const minDays = 0, maxDays = 15;
  const reviewTime = deliveryTime.getTime() + (Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays) * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 86400000);
  return new Date(reviewTime);
}

// --- Media URL logic by category ---
const defaultMediaUrls = {
  image: [
  ],
  video: [
    'https://cdn.pixabay.com/video/2022/09/04/130211-748134196_large.mp4',
    'https://cdn.pixabay.com/video/2015/10/16/1006-142621176_large.mp4',
    'https://cdn.pixabay.com/video/2024/03/29/206029_large.mp4',
    'https://cdn.pixabay.com/video/2017/05/29/9398-219552669_large.mp4',
    'https://cdn.pixabay.com/video/2024/09/13/231147_large.mp4'
  ],
  gif: [
    'https://cdn.pixabay.com/animation/2023/05/01/21/12/21-12-34-12_512.gif',
    'https://cdn.pixabay.com/animation/2023/04/08/02/06/02-06-37-700_512.gif',
    'https://cdn.pixabay.com/animation/2024/01/28/09/58/09-58-50-177_512.gif',
    'https://cdn.pixabay.com/animation/2023/03/08/06/11/06-11-42-592_512.gif',
    'https://cdn.pixabay.com/animation/2025/01/27/15/06/15-06-35-236_512.gif'
  ],
};

// Example: Add/expand as needed for real/fake categories
// const categoryMediaUrls: Record<string, { image: string[]; video: string[]; gif: string[] }> = {
const categoryMediaUrls: Record<string, { image: string[] }> = {
  Women: {
    image: [
      "https://images.unsplash.com/photo-1513094735237-8f2714d57c13?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1584998316204-3b1e3b1895ae?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489105008-063e31b2dbcd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1698264957344-b4ffacc69b6b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1615240945501-58d2563db9e1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1676145731619-23094f3f8895?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1565292334631-95d1dd9e2970?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1723277174725-90e2b1212f2e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1524255684952-d7185b509571?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1593380090147-a2192b72a9ae?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1588117305388-c2631a279f82?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1657550853413-a646ba6a1877?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1585229593056-ddd606c911de?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1552874869-5c39ec9288dc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1589212987511-4a924cb9d8ac?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618068291962-bb16bfca7f0f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1598554793905-075f7b355cd9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618333452884-5c8d211ed2ad?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489108204-9c36d713341f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1631812908376-b8a74b7b6d61?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1627489108809-143dbf921060?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617059322001-a61ce9551e08?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1708363390856-172663a263d1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",           
      "https://images.unsplash.com/photo-1616847220575-31b062a4cd05?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d29tZW4lMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1613423755148-0ff5515d60be?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1602303894456-398ce544d90b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1708363390932-15e8a29c0f56?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1680423032397-68aee6a38243?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1639497350985-cddf9f433a45?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1590400516695-36708d3f964a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1576082866986-460d8f2ae4fe?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1618244965061-1d27b208d6e8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fHdvbWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://plus.unsplash.com/premium_photo-1675186049419-d48f4b28fe7c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      'https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGZhc2hpb258ZW58MHx8MHx8fDA%3D',

    ],
    // video: [
    // ],
    // gif: [
    // ],
  },
  Men: {
    image: [
      'https://cdn.pixabay.com/photo/2020/08/24/21/44/man-5515150_1280.jpg',
      'https://plus.unsplash.com/premium_photo-1707932495000-5748b915e4f2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGZhc2hpb258ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D',
      "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1621096029176-9dbb22a56808?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1593757147298-e064ed1419e5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1662758973728-4e019aaf6f7a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1665832102447-a853788f620c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1614495039368-525273956716?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1621444449288-7c930391fe0d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1622497170185-5d668f816a56?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1656695230389-01185e6fbff8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1665832102183-b232574131ff?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1697517529967-fc6b1e45563b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1636590416708-68a4867918f1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1609195994377-dbffba3a4eb4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1532074662130-17f5486532b0?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVuJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1665832102899-2b3f12cf991e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1535949686800-a6b928ce2fd5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1559582798-678dfc71ccd8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1665832103026-462c445cad5b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1656696160196-3c3039d2b200?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fG1lbiUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D"  
    ],
    // video: [
    // ],
    // gif: [
    // ],
  },
  Kids: {
    image: [
      "https://images.unsplash.com/photo-1590480598135-3be152c87913?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1611428813653-aa606c998586?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1578897367107-2828e351c8a8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1622218286192-95f6a20083c7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1502451885777-16c98b07834a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1613456209686-a89d1e2024ab?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1534880786429-7cb3199b7b0f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1714889307579-3dabfd972c49?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1543854704-2b1b011701e6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1584847689007-3a9fe6ba7132?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1541580104-e98c7a5dd683?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1715317826400-81513d597fa2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1497169345602-fbb1a307de16?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1502808777105-c5f7b639feae?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1632661762942-e49c063bc84b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1521804569552-2d8b03be780a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1618845033162-eefc40672252?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1697906099479-20639005777e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1519457851-06c11d8bfadc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1703615940234-14ab72550e40?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1696453632995-ed65fe963dbb?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1715317931439-541563107b99?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1487033858121-f6f74a05c1de?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1520413624224-91d4554286bb?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1541015492536-31d513c59861?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1529776292731-c2246c65df5a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1534881210762-dc317b7fb644?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1627859774205-83c1279a6382?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1636130748629-655be0c60041?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1555895340-a5ecebc7a9ad?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1530304027019-6bd0e056c223?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1590995385808-7eb142fde16a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1555895417-90b96a0485b5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzh8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8S2lkcyUyMGZhc2hpb258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1529756148791-fbca69bfe693?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1541580621-47abd5e3da8b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1541580620-23a640b30338?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1541580621-cb65cc53084b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1505377059067-e285a7bac49b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1696453632996-e7d286cfaca0?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1577525179375-b870f894a365?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1714889247493-f124971ec31b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1505312904023-e4c5d6fcfa4a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1636485426024-aa436369585d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fEtpZHMlMjBmYXNoaW9ufGVufDB8fDB8fHww"
    ],
    // video: [

    // ],
    // gif: [

    // ],
  },
  Accessories: {
    image: [
      "https://images.unsplash.com/photo-1506169894395-36397e4aaee4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1612902457652-33aff0a641fa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1511556820780-d912e42b4980?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1537832816519-689ad163238b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1586878341523-7acb55eb8c12?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1705909237050-7a7625b47fac?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1710552524021-a8dc68c2a8dc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1583292650898-7d22cd27ca6f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1603298333647-ed142dbbc9d9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1723576441002-ce9fe9c06343?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1571974096035-bc3568627608?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1682364853446-db043f643207?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1702326626601-74d2e86922b4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1586878340978-f9ca47ad7d72?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1659708722557-3804cf131098?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859677-156e153b2e66?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1618436623941-40676b73df53?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTV8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1610797168512-a0106d5ea890?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1569388330292-79cc1ec67270?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1723802205505-2f88b2227718?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1590548784585-643d2b9f2925?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1559070081-648fb00b2ed1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1685800750376-f4497f5da428?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1693212793204-bcea856c75fe?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1600721391689-2564bb8055de?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1564595016712-175004de04ff?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1673710672680-944563ff9cce?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1564595037946-dcb73763aa57?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859527-5f30b1631be9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1589363463135-e811e08d8ace?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1547713044-6681f3daa9e7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1641290748359-1d944fc8359a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1731586249471-82bb9b2f769a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1682364853135-0840844c3cc5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1710552520473-f78f26d95708?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1586878341340-1971696a9b71?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1586878340946-f81bfad535f1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODd8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1674329042475-de1a95b4ca62?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1689367436414-7acc3fdc3e2a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTF8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1684407261522-48ad66a060e9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1687253946687-a3713aa25b2f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxhY2Nlc3Nvcmllc3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YWNjZXNzb3JpZXN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859613-88a1fff8e2e4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1559563458-527698bf5295?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1659708701940-e60893ef03d0?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1569388330338-53ecda03dfa1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1702325107940-88f9cd4468c2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1722340321190-1c7b7384e89b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1623998021450-85c29c644e0d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1682745230951-8a5aa9a474a0?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1620787039767-fb5ea285fe98?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859517-0d6aed78ac87?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1631872112096-7b1b700237f6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1613843351058-1dd06fda7c02?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1589731119540-c4586781dae1?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1561172478-a203d9c8290e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859614-c293188135b7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1617048931430-5eb626d81e71?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108859519-8ac78fd1b912?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1631120312208-249be802ba00?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1621939745912-aad97fd3a34d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1542779632-539b861ee8f9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODN8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1623680621227-533cdf197a31?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1599108860003-036fb838954a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTZ8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1571582665859-4a5f472ee21b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTl8fGFjY2Vzc29yaWVzfGVufDB8fDB8fHww"
    ],
    // video: [
    //   'https://fakecdn.com/accessories/video1.mp4',
    // ],
    // gif: [
    //   'https://fakecdn.com/accessories/gif1.gif',
    // ],
  },
  Sports: {
    image: [
      "https://images.unsplash.com/photo-1531520563951-4c0e3d3fcacc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1536244955395-0b8a2a5ab5df?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1597296591262-3a1229aaecec?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615912022085-d7f55b95887f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1735956929776-5d0326770665?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1611251951013-a036c64d09c9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1559278092-640149b5a287?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1735956929927-511f5f05ddaa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1678356717973-f2177782388a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1631955081622-fb57ae4cb686?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1641578784369-bf2a6e0ef5f8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1613338761484-f982b6362b9d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1643622782660-30dedcd8d75a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1559278079-0bbb5e183b3d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1658314755561-389d5660ee54?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1696661115319-a9b6801e2571?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1621931678092-3673b7d295be?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1599920066577-cdb25eecca12?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1520156557489-31c63271fcd4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODN8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1641483305819-587106f06f83?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODd8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615912265844-dac2071fd173?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1552064578-5892872ab7c6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1606902965551-dce093cda6e7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1585036156261-1e2ac055414d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1528858755052-cacfa0dd164a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1606903037631-f09fd0bd74b4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1558151507-c1aa3d917dbb?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1645207803533-e2cfe1382f2c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1555377634-aedcf39fd9ad?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1434682966726-19ad3a76e143?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1627685317100-be31be2b0116?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1616454250522-195cb61fe5bd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1743224445912-34c43fe32cc8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1682523426986-92746735ccc2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1620036717312-0f95797bf49d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1722077457674-85b36b9e1d2b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1735838639311-b7f3a3c5e0ea?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1735838639273-22c28a35a843?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1656950246075-68a65e9c3ea6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1570192164067-6f2d28702ae8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1613593013133-b6e122feafe8?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1654130491626-9cbb6f12c488?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1602670935585-db18a44de499?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1644908481487-1d8c8fa3c5f5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1466434319174-225dbccce7d2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1691315909393-c5c91e22760f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1599920063475-432a9fbf9b95?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1637714619771-50f333a6066b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1727314076961-8290150b90cc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxTcG9ydHMlMjB3ZWFyfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1522040942177-269680274214?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1585036398651-c89d459f07b7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1531755445437-3596b282dafc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8U3BvcnRzJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1552364142-f06dd635a796?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1507138170390-6625c5fd0115?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1515614557830-ae0df9016e19?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615912022073-91312960eff3?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1610720991840-457ad2c7a658?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615912022092-6e8ea1cfe9f6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1657888409157-faf9fa8d9464?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1602670935908-094f41dcb67c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1678355964547-d23bde056f9a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1641578766048-ba58aa835483?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1735838639271-cdc34c23e247?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1597297260448-3cc8d0a38388?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1585500198661-a2c94143964d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1612015670817-0127d21628d4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1653438945089-2420216b785e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1677124121040-b57ce9071901?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODR8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1583025684166-c0a2a2102451?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTB8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615570484051-3f5c08d4c87e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTF8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1615470017119-ea31c94937ea?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTV8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1611812302603-cf193a4cee96?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTl8fFNwb3J0cyUyMHdlYXJ8ZW58MHx8MHx8fDA%3D"
    ],
    // video: [
    //   'https://fakecdn.com/sports/video1.mp4',
    // ],
    // gif: [
    //   'https://fakecdn.com/sports/gif1.gif',
    // ],
  },
  Electronics: {
    image: [
      "https://images.unsplash.com/photo-1694466464626-7bd06595cf2d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1594843665794-446ce915d840?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1733786462849-a2f2adad79b5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1636614597280-3dde89cbd6cc?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1502096472573-eaac515392c6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1706166987870-539ffd8286e7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1706289835536-3aa7b81aa2fd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1726219836040-d9b7b8c0d46f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1620783770629-122b7f187703?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1711397996070-f3fd14f6b139?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1727513372271-26957738f010?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1521661978458-5a2bec6b6e09?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1511975634005-8f73acab9525?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1604533107302-d3adcc6b6d82?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959327377-8cb3f75ac03d?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746958922488-28d0a72ec63c?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1699796990049-3406a9991baa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1666460811258-c7ceac639561?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1733786463247-e1e09600fc44?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1636614223954-db6a663293ef?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1594995846645-d58328c3ffa4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1706166987972-5c772443f29a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1641671668696-f5061907290f?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1578116397592-7cf7eb77a677?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1673718423569-27ce5b3857c2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1673718424704-51d0d2ca1fd2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959354700-5ab3cb89b689?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1711397996179-bd4bd28c78e6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1707588521743-636355884c21?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1589894404892-7310b92ea7a2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959326980-4d28e10fc446?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746958960271-88c9db492c7a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746958934981-72f5a32b9f2b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746958993100-f65dd010ee78?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959327350-229babde0829?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1699796990062-c7a064563fc2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1699796990055-c866ac0aa6ef?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1699796990179-c52a790030fa?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nzl8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1677742380014-e660caefef34?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1733786463192-ddf0b8830564?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1643180232906-6c9caa7cd76a?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8RWxlY3Ryb25pY3MlMjBwcm9kdWN0c3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1631747207274-34bb74416713?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1503177757247-03a572161a63?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1503177657524-94eb8840a0f5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1706166987869-5482b5ad8dd5?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1707485122968-56916bd2c464?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959354674-7a8ccaf651e2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1673718423886-ba603e698efd?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1673718424091-5fb734062c05?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1673718423582-f3378102c0d7?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDJ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1711397996073-c9a629ebc05b?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1602781975725-cab34bd38d94?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1727542908464-789161b9bfe6?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959023493-9c7ab3c10ee2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746958975330-64a5492e64c3?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1746959292253-fab7ecf38fb4?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1641563786213-185d68345426?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1699796990063-ee34d2eef5e2?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1695712551666-e0c354b1e6b9?fm=jpg&amp;q=60&amp;w=3000&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODB8fEVsZWN0cm9uaWNzJTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D"
    ],
    // video: [
    //   'https://fakecdn.com/electronics/video1.mp4',
    // ],
    // gif: [
    //   'https://fakecdn.com/electronics/gif1.gif',
    // ],
  },
};

function getRandomMediaUrls(category, type, min, max) {
  const urls = (categoryMediaUrls[category]?.[type] || defaultMediaUrls[type]);
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = urls.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
// --- End media URL logic ---

const N = 100;
const M=1; // Number of products to generate for testing

function generateReviewsForProduct(product: any, n: number): any[] {
  const reviews: any[] = [];
  for (let i = 0; i < n; i++) {
    const variants = product.variantCombinations || [];
    const randomVariant = variants.length > 0 ? variants[Math.floor(Math.random() * variants.length)] : null;
    const user = users[Math.floor(Math.random() * users.length)];
    const device = user.devices[Math.floor(Math.random() * user.devices.length)];
    const sample = reviewSamples[Math.floor(Math.random() * reviewSamples.length)];
    const images = getRandomSubset(imageUrls, 0, 5);
    const videos = getRandomSubset(videoUrls, 0, 2);
    // Date logic
    const purchaseDateObj = randomPurchaseDateAfterProductCreatedAt(product.createdAt);
    const deliveryTimeObj = randomDeliveryTimeAfterPurchase(purchaseDateObj);
    const reviewDateObj = randomReviewDateAfterDelivery(deliveryTimeObj);
    const status = randomStatus();
    const moderation = randomModeration(reviewDateObj.toISOString(), status);
    const tags = getRandomTags();
    const replies = getRandomReplies(status, moderation?.reviewedAt, reviewDateObj.toISOString());
    reviews.push({
      _id: reviewDateObj.toISOString(), // Use review creation time as _id
      productId: product.productId,
      category: product.category,
      variantId: randomVariant?.variantId || null,
      combination: randomVariant?.combination || null,
      user,
      platform: device.platform,
      deviceFingerprint: device.deviceFingerprint,
      userAgent: device.userAgent,
      ipAddress: device.ipAddress,
      language: 'en',
      orderId: randomOrderId(),
      deliveryTime: deliveryTimeObj.toISOString(),
      rating: randomRatingObject(),
      title: sample.title,
      reviewText: sample.reviewText,
      pros: sample.pros,
      cons: sample.cons,
      media: {
        images,
        videos
      },
      purchaseDate: purchaseDateObj.toISOString(),
      reviewDate: reviewDateObj.toISOString(),
      likes: randomInt(1000),
      dislikes: randomInt(1000),
      helpfulVotes: randomInt(1000),
      reported: false,
      status,
      moderation,
      tags,
      isEdited: false,
      replies,
    });
  }
  return reviews;
}

let allReviews: any[] = [];

function randomReviewCount() {
  if (Math.random() < 0.9) {
    // 90% chance: 0–100
    return Math.floor(Math.random() * 101);
  } else {
    // 10% chance: 100–1000
    return 100 + Math.floor(Math.random() * 901);
  }
}
function transformVariantOptions(variantOptions: any) {
  const variantIndex: { name: string; value: string }[] = [];
  for (const option of variantOptions) {
    for (const val of option.values) {
      variantIndex.push({ name: option.name, value: val });
    }
  }
  return variantIndex;
}

function generateTestProducts(m: number, n: number): any[] {
  const result: any[] = [];
  for (let i = m; i <= n; i++) {
    const sample = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
    const prod = JSON.parse(JSON.stringify(sample));
    prod.productId = `PTEST${i.toString().padStart(4, '0')}`;
    prod.productName = `${sample.productName} ${i}`;
    prod.slug = `${sample.slug}-${i}`;
    prod._id = prod.productId;
    prod.createdAt = randomProductCreatedAt().toISOString();
    prod.quantity=Math.floor(Math.random() * 1000)
    if(prod.quantity>0)
    {
      prod.instock='true'
    }
    else{
      prod.instock='false'
    }
    prod.variantOptions = transformVariantOptions(prod.variantOptions);
    // --- Assign random media by category ---
    const cat = prod.category;
    prod.globalMedia = [];
    prod.globalMedia.push(...getRandomMediaUrls(cat, 'image', 1, 5).map(url => ({ type: 'image', url })));
    prod.globalMedia.push(...getRandomMediaUrls(cat, 'video', 0, 3).map(url => ({ type: 'video', url })));
    prod.globalMedia.push(...getRandomMediaUrls(cat, 'gif', 0, 3).map(url => ({ type: 'gif', url })));
    // --- Assign random media to each variant ---
    if (Array.isArray(prod.variantCombinations)) {
      for (const variant of prod.variantCombinations) {
        variant.variantMedia = [];
        variant.variantMedia.push(...getRandomMediaUrls(cat, 'image', 1, 5).map(url => ({ type: 'image', url })));
        variant.variantMedia.push(...getRandomMediaUrls(cat, 'video', 0, 3).map(url => ({ type: 'video', url })));
        variant.variantMedia.push(...getRandomMediaUrls(cat, 'gif', 0, 3).map(url => ({ type: 'gif', url })));
      }
    }
    // Generate reviews for this product
    const reviewCount = randomReviewCount();
    const reviews = generateReviewsForProduct(prod, reviewCount);
    allReviews.push(...reviews); // Push directly to global array
    // Calculate ratings
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    for (const review of reviews) {
      const star = Math.round(review.rating.overall);
      if (starCounts[star] !== undefined) starCounts[star]++;
      ratingSum += review.rating.overall;
    }
    prod.ratings = {
      "1_star": starCounts[1],
      "2_star": starCounts[2],
      "3_star": starCounts[3],
      "4_star": starCounts[4],
      "5_star": starCounts[5]
    };
    prod.totalReviews = reviews.length;
    prod.averageRating = reviews.length > 0 ? Math.round((ratingSum / reviews.length) * 10) / 10 : 0;
    result.push(prod);
  }
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const db = await getDb();
    const testProducts = generateTestProducts(M,N);
    const bulkOps = testProducts.map((product: any) => ({
      insertOne: { document: product }
    }));
    const productResult = await db.collection('products').bulkWrite(bulkOps, { ordered: false });
    let reviewResult = { insertedCount: 0 };
    if (allReviews.length > 0) {
      const reviewOps = allReviews.map((doc) => ({ insertOne: { document: doc } }));
      reviewResult = await db.collection('reviews').bulkWrite(reviewOps as any, { ordered: false });
    }
    res.status(200).json({ message: `Pushed ${N} test products and ${allReviews.length} reviews`, productResult, reviewResult });
  } catch (error) {
    // Improved error logging
    console.error('Push products/reviews error:', error);
    res.status(500).json({ error: 'Failed to push products/reviews', message: error?.message, stack: error?.stack, details: error });
  }
} 