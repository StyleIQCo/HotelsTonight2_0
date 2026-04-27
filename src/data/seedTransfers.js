// Seeded exchange listings — these simulate other users who listed their
// bookings before the current session started. Shown in the marketplace
// to make the Exchange feel alive on first load.

const today = new Date().toISOString().slice(0, 10);

export const seedTransfers = [
  {
    id: 'tx_seed_001',
    bookingId: null, // seeded — no real booking behind it
    hotelId: 'h_standard_highline',
    hotelName: 'The Standard, High Line',
    neighborhood: 'Meatpacking District, New York',
    hotelImage: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=70',
    roomType: 'Deluxe Room',
    checkInTime: 'Standard check-in (3 PM)',
    originalPrice: 742,   // what original guest paid (incl. tax)
    listPrice: 590,       // buyer pays this — 20% discount
    sellerName: 'J. Park',
    sellerNote: 'Flight got cancelled, can\'t make it tonight. Clean room, great hotel.',
    listedAt: new Date(Date.now() - 38 * 60000).toISOString(), // 38 min ago
    status: 'available',
    checkInDate: today,
  },
  {
    id: 'tx_seed_002',
    bookingId: null,
    hotelId: 'h_wynn_lv',
    hotelName: 'Wynn Las Vegas',
    neighborhood: 'The Strip, Las Vegas',
    hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=70',
    roomType: 'Standard Room',
    checkInTime: 'Standard check-in (3 PM)',
    originalPrice: 534,
    listPrice: 420,
    sellerName: 'M. Torres',
    sellerNote: 'Family emergency — need to fly home. Hate to miss it.',
    listedAt: new Date(Date.now() - 112 * 60000).toISOString(), // 112 min ago
    status: 'available',
    checkInDate: today,
  },
  {
    id: 'tx_seed_003',
    bookingId: null,
    hotelId: 'h_proper_sf',
    hotelName: 'Proper Hotel San Francisco',
    neighborhood: 'Mid-Market, San Francisco',
    hotelImage: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=70',
    roomType: 'Junior Suite',
    checkInTime: 'Early check-in (11 AM)',
    originalPrice: 961,
    listPrice: 780,
    sellerName: 'A. Chen',
    sellerNote: 'Conference ended early, heading back to LA. Suite is beautiful — someone should enjoy it.',
    listedAt: new Date(Date.now() - 8 * 60000).toISOString(), // 8 min ago
    status: 'available',
    checkInDate: today,
  },
];
