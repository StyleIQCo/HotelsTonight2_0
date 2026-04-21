// Mock partner hotel inventory for the NightDrop demo.
//
// The roster is intentionally upscale — boutique, design-forward, and
// luxury properties in the six launch markets: Bellevue (WA), Seattle,
// New York, Las Vegas, Los Angeles, and San Francisco. These are fictional
// names inspired by each neighborhood so we aren't implying a partnership
// with any real brand.
//
// `vacancyRate` is 0..1 (fraction of rooms unsold for tonight).
// `rackRate` is the hotel's published nightly rate in USD.
// Discount is computed dynamically in src/lib/pricing.js — it is NOT stored.

export const initialHotels = [
  // ───── Bellevue, WA ─────
  {
    id: 'h_ashford_bellevue',
    name: 'The Ashford Bellevue',
    neighborhood: 'Downtown, Bellevue',
    lat: 47.6152, lng: -122.1968,
    stars: 5,
    rackRate: 529,
    vacancyRate: 0.42,
    totalRooms: 85,
    amenities: ['Skybridge lounge', 'Nordic spa', 'Michelin chef residency', 'EV charging', 'Free Wi-Fi'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Skybridge views over Meydenbauer Bay with a Nordic spa downstairs.'
  },
  {
    id: 'h_meydenbauer_grand',
    name: 'Meydenbauer Grand',
    neighborhood: 'Old Bellevue',
    lat: 47.6098, lng: -122.2014,
    stars: 4,
    rackRate: 389,
    vacancyRate: 0.58,
    totalRooms: 120,
    amenities: ['Waterfront patio', 'Wine cellar', 'Tesla house car', 'Pet concierge'],
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'A quiet, low-rise luxury hotel tucked off Main Street.'
  },

  // ───── Seattle, WA ─────
  {
    id: 'h_northstar_seattle',
    name: 'Northstar Pike Place',
    neighborhood: 'Pike Place, Seattle',
    lat: 47.6092, lng: -122.3422,
    stars: 4,
    rackRate: 349,
    vacancyRate: 0.55,
    totalRooms: 95,
    amenities: ['Elliott Bay views', 'Pour-over bar', 'Yoga studio', 'Farm-to-table restaurant'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049035182-249067d7ef5d?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Corner suites overlooking the market and the bay.'
  },
  {
    id: 'h_rainier_fifth',
    name: 'The Rainier Fifth',
    neighborhood: 'Downtown, Seattle',
    lat: 47.6089, lng: -122.3380,
    stars: 5,
    rackRate: 599,
    vacancyRate: 0.31,
    totalRooms: 72,
    amenities: ['Rooftop observatory', 'Club lounge', 'Butler service', 'Indoor lap pool'],
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'A 1920s tower reimagined as a five-star hideaway.'
  },

  // ───── New York, NY ─────
  {
    id: 'h_harborlight_tribeca',
    name: 'Harborlight Tribeca',
    neighborhood: 'Tribeca, New York',
    lat: 40.7195, lng: -74.0094,
    stars: 5,
    rackRate: 712,
    vacancyRate: 0.28,
    totalRooms: 68,
    topSecret: true,
    topSecretDiscount: 0.40,
    amenities: ['Michelin restaurant', 'Hammam spa', 'Private screening room', 'Concierge', 'Free Wi-Fi'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Quiet luxury on a cobblestone block downtown.'
  },
  {
    id: 'h_madison_park_collection',
    name: 'The Madison Park Collection',
    neighborhood: 'Flatiron, New York',
    lat: 40.7420, lng: -73.9880,
    stars: 4,
    rackRate: 489,
    vacancyRate: 0.46,
    totalRooms: 140,
    amenities: ['Park-view terrace', 'Whiskey library', 'Gilbert & George gallery', 'Peloton gym'],
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Art-filled rooms overlooking Madison Square Park.'
  },
  {
    id: 'h_velvet_vine_soho',
    name: 'Velvet & Vine SoHo',
    neighborhood: 'SoHo, New York',
    lat: 40.7237, lng: -74.0029,
    stars: 4,
    rackRate: 529,
    vacancyRate: 0.53,
    totalRooms: 88,
    amenities: ['Cast-iron loft rooms', 'Natural wine bar', 'Atelier suites', 'Bespoke in-room fragrance'],
    image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049035182-249067d7ef5d?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Loft-ceiling suites above a natural wine bar.'
  },

  // ───── Las Vegas, NV ─────
  {
    id: 'h_obsidian_strip',
    name: 'The Obsidian',
    neighborhood: 'The Strip, Las Vegas',
    lat: 36.1126, lng: -115.1729,
    stars: 5,
    rackRate: 649,
    vacancyRate: 0.48,
    totalRooms: 180,
    topSecret: true,
    topSecretDiscount: 0.42,
    amenities: ['Penthouse pools', 'Chef-de-cuisine tasting', 'High-limit lounge', 'Spa & hammam'],
    image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'All-suite black-glass tower with Strip-facing penthouse pools.'
  },
  {
    id: 'h_summerlin_pines',
    name: 'Summerlin Pines Resort',
    neighborhood: 'Summerlin, Las Vegas',
    lat: 36.1785, lng: -115.3097,
    stars: 4,
    rackRate: 379,
    vacancyRate: 0.64,
    totalRooms: 220,
    amenities: ['Red Rock vistas', 'Golf access', 'Desert botanical spa', 'Fire-pit suites'],
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Desert calm, twenty minutes from the lights.'
  },

  // ───── Los Angeles, CA ─────
  {
    id: 'h_beverly_ledger',
    name: 'The Beverly Ledger',
    neighborhood: 'Beverly Hills, Los Angeles',
    lat: 34.0696, lng: -118.4000,
    stars: 5,
    rackRate: 719,
    vacancyRate: 0.33,
    totalRooms: 96,
    topSecret: true,
    topSecretDiscount: 0.40,
    amenities: ['Cabana pool deck', 'Rolls-Royce house car', 'Members club', 'Garden spa'],
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'A Beverly Hills classic with a members-only rooftop.'
  },
  {
    id: 'h_sunpalm_silver_lake',
    name: 'Sunpalm Silver Lake',
    neighborhood: 'Silver Lake, Los Angeles',
    lat: 34.0869, lng: -118.2702,
    stars: 4,
    rackRate: 349,
    vacancyRate: 0.51,
    totalRooms: 60,
    amenities: ['Saltwater pool', 'Patio bar', 'Vinyl library', 'EV charging'],
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Mid-century courtyard hotel with a killer pool.'
  },

  // ───── San Francisco, CA ─────
  {
    id: 'h_marquee_soma',
    name: 'The Marquee SoMa',
    neighborhood: 'SoMa, San Francisco',
    lat: 37.7785, lng: -122.4056,
    stars: 5,
    rackRate: 489,
    vacancyRate: 0.57,
    totalRooms: 110,
    amenities: ['Rooftop pool', 'Private gallery floor', 'Chefs counter', 'Wellness lounge'],
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049035182-249067d7ef5d?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'Design-forward rooms two blocks from Moscone.'
  },
  {
    id: 'h_palladium_union_square',
    name: 'Palladium Union Square',
    neighborhood: 'Union Square, San Francisco',
    lat: 37.7879, lng: -122.4075,
    stars: 4,
    rackRate: 419,
    vacancyRate: 0.40,
    totalRooms: 135,
    amenities: ['Belle Époque lobby', 'Champagne bar', 'Harbor-view suites', 'Evening turndown'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=70',
    gallery: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1586611292717-f828b167408c?auto=format&fit=crop&w=1200&q=70',
    ],
    tagline: 'A restored 1908 landmark off Maiden Lane.'
  }
];
