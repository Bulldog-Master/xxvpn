// Server data with geographic coordinates and performance metrics
export interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  load: number; // 0-100 percentage
  ping: number | null; // milliseconds, null if not tested
  flag: string;
  premium: boolean;
  maxSpeed: string; // e.g., "1 Gbps"
  protocols: string[];
  maintenance: boolean;
}

export const vpnServers: VPNServer[] = [
  // North America
  {
    id: 'us-east-1',
    name: 'New York',
    country: 'United States',
    city: 'New York',
    region: 'North America',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    load: 45,
    ping: null,
    flag: '🇺🇸',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'us-west-1',
    name: 'Los Angeles',
    country: 'United States',
    city: 'Los Angeles',
    region: 'North America',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    load: 62,
    ping: null,
    flag: '🇺🇸',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'ca-central-1',
    name: 'Toronto',
    country: 'Canada',
    city: 'Toronto',
    region: 'North America',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    load: 38,
    ping: null,
    flag: '🇨🇦',
    premium: false,
    maxSpeed: '500 Mbps',
    protocols: ['OpenVPN', 'WireGuard'],
    maintenance: false
  },

  // Europe
  {
    id: 'uk-london-1',
    name: 'London',
    country: 'United Kingdom',
    city: 'London',
    region: 'Europe',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    load: 55,
    ping: null,
    flag: '🇬🇧',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'de-frankfurt-1',
    name: 'Frankfurt',
    country: 'Germany',
    city: 'Frankfurt',
    region: 'Europe',
    coordinates: { lat: 50.1109, lng: 8.6821 },
    load: 41,
    ping: null,
    flag: '🇩🇪',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'ch-zurich-1',
    name: 'Zurich',
    country: 'Switzerland',
    city: 'Zurich',
    region: 'Europe',
    coordinates: { lat: 47.3769, lng: 8.5417 },
    load: 29,
    ping: null,
    flag: '🇨🇭',
    premium: true,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'fr-paris-1',
    name: 'Paris',
    country: 'France',
    city: 'Paris',
    region: 'Europe',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    load: 67,
    ping: null,
    flag: '🇫🇷',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard'],
    maintenance: false
  },
  {
    id: 'nl-amsterdam-1',
    name: 'Amsterdam',
    country: 'Netherlands',
    city: 'Amsterdam',
    region: 'Europe',
    coordinates: { lat: 52.3676, lng: 4.9041 },
    load: 52,
    ping: null,
    flag: '🇳🇱',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },

  // Asia Pacific
  {
    id: 'jp-tokyo-1',
    name: 'Tokyo',
    country: 'Japan',
    city: 'Tokyo',
    region: 'Asia Pacific',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    load: 48,
    ping: null,
    flag: '🇯🇵',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'sg-singapore-1',
    name: 'Singapore',
    country: 'Singapore',
    city: 'Singapore',
    region: 'Asia Pacific',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    load: 35,
    ping: null,
    flag: '🇸🇬',
    premium: false,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },
  {
    id: 'au-sydney-1',
    name: 'Sydney',
    country: 'Australia',
    city: 'Sydney',
    region: 'Asia Pacific',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    load: 43,
    ping: null,
    flag: '🇦🇺',
    premium: false,
    maxSpeed: '500 Mbps',
    protocols: ['OpenVPN', 'WireGuard'],
    maintenance: false
  },
  {
    id: 'hk-hongkong-1',
    name: 'Hong Kong',
    country: 'Hong Kong',
    city: 'Hong Kong',
    region: 'Asia Pacific',
    coordinates: { lat: 22.3193, lng: 114.1694 },
    load: 61,
    ping: null,
    flag: '🇭🇰',
    premium: true,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  },

  // South America
  {
    id: 'br-saopaulo-1',
    name: 'São Paulo',
    country: 'Brazil',
    city: 'São Paulo',
    region: 'South America',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    load: 71,
    ping: null,
    flag: '🇧🇷',
    premium: false,
    maxSpeed: '500 Mbps',
    protocols: ['OpenVPN', 'WireGuard'],
    maintenance: false
  },

  // Africa & Middle East
  {
    id: 'za-capetown-1',
    name: 'Cape Town',
    country: 'South Africa',
    city: 'Cape Town',
    region: 'Africa',
    coordinates: { lat: -33.9249, lng: 18.4241 },
    load: 32,
    ping: null,
    flag: '🇿🇦',
    premium: true,
    maxSpeed: '500 Mbps',
    protocols: ['OpenVPN', 'WireGuard'],
    maintenance: false
  },
  {
    id: 'ae-dubai-1',
    name: 'Dubai',
    country: 'United Arab Emirates',
    city: 'Dubai',
    region: 'Middle East',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    load: 56,
    ping: null,
    flag: '🇦🇪',
    premium: true,
    maxSpeed: '1 Gbps',
    protocols: ['OpenVPN', 'WireGuard', 'IKEv2'],
    maintenance: false
  }
];

export const getServersByRegion = (region: string) => {
  return vpnServers.filter(server => server.region === region);
};

export const getAllRegions = () => {
  const regions = Array.from(new Set(vpnServers.map(server => server.region)));
  return regions.sort();
};

export const getServerById = (id: string) => {
  return vpnServers.find(server => server.id === id);
};

export const getLoadColor = (load: number) => {
  if (load < 30) return 'text-green-600';
  if (load < 70) return 'text-yellow-600';
  return 'text-red-600';
};

export const getLoadLevel = (load: number) => {
  if (load < 30) return 'low';
  if (load < 70) return 'medium';
  return 'high';
};