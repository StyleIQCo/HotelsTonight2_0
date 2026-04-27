// Seeded guest reviews for partner hotels.
// Each review: id, hotelId, authorName, authorCity, rating (1-5), date, stayType, text.

export const initialReviews = [
  // ─── The Edgewater Hotel ────────────────────────────────────────────
  {
    id: 'r_edge_1', hotelId: 'h_edgewater_seattle',
    authorName: 'Marcus T.', authorCity: 'San Francisco, CA',
    rating: 5, date: '2026-03-14', stayType: 'Business',
    text: 'Booked at 9 PM via NightDrop and got a bay-view room that normally runs $389 for $218. Woke up to seals barking on the dock and mountains in the window. Six Seven Restaurant\'s salmon is worth coming to Seattle for by itself.',
  },
  {
    id: 'r_edge_2', hotelId: 'h_edgewater_seattle',
    authorName: 'Priya L.', authorCity: 'Portland, OR',
    rating: 5, date: '2026-02-28', stayType: 'Couple',
    text: 'The only hotel in Seattle built over the water — it shows. The fire pit lounge with Elliott Bay out every window is perfection after a rainy day. The NightDrop price was legitimately shocking for the quality.',
  },
  {
    id: 'r_edge_3', hotelId: 'h_edgewater_seattle',
    authorName: 'Derek N.', authorCity: 'Vancouver, BC',
    rating: 4, date: '2026-01-10', stayType: 'Solo',
    text: 'One of the more character-rich hotels in Seattle. The Beatles stayed here in 1964 and fished from their window — the hotel leans into its history well. Room was large and very comfortable.',
  },

  // ─── Kimpton Palladian ──────────────────────────────────────────────
  {
    id: 'r_pall_s1', hotelId: 'h_kimpton_palladian',
    authorName: 'Sophie R.', authorCity: 'Chicago, IL',
    rating: 5, date: '2026-03-01', stayType: 'Couple',
    text: 'The complimentary wine hour alone is worth the stay — they pour well and the lobby fills with the best crowd. Shaker + Spear cocktails are excellent. Completely dog-friendly too, which made traveling with our Labrador stress-free.',
  },
  {
    id: 'r_pall_s2', hotelId: 'h_kimpton_palladian',
    authorName: 'Tom W.', authorCity: 'Los Angeles, CA',
    rating: 4, date: '2026-02-15', stayType: 'Business',
    text: 'Great Belltown location — walkable to Pike Place, easy Uber to South Lake Union tech campus. Room was well-designed and quiet. The Italian Renaissance details in the lobby are a nice surprise after walking in from the rain.',
  },
  {
    id: 'r_pall_s3', hotelId: 'h_kimpton_palladian',
    authorName: 'Ava K.', authorCity: 'Seattle, WA',
    rating: 4, date: '2026-01-22', stayType: 'Girls Trip',
    text: 'Treated ourselves to a staycation and NightDrop made it completely affordable. The breakfast spread is excellent. Staff remembered our room preferences on the second morning without being asked.',
  },

  // ─── Crosby Street Hotel ────────────────────────────────────────────
  {
    id: 'r_crosby_1', hotelId: 'h_crosby_street',
    authorName: 'Isabella M.', authorCity: 'Miami, FL',
    rating: 5, date: '2026-04-01', stayType: 'Couple',
    text: 'The cobblestone courtyard garden is something you wouldn\'t believe exists in SoHo. Booked as a Top Secret deal and when the hotel revealed I genuinely made a sound. Crosby Bar is the best hotel bar in New York.',
  },
  {
    id: 'r_crosby_2', hotelId: 'h_crosby_street',
    authorName: 'Owen D.', authorCity: 'Los Angeles, CA',
    rating: 5, date: '2026-03-08', stayType: 'Business',
    text: 'Firmdale does no wrong. This is the Manhattan version of their Covent Garden hotel in London. The room had a custom upholstered headboard and hand-picked art. Concierge got me a SoHo restaurant table at 45 minutes notice.',
  },
  {
    id: 'r_crosby_3', hotelId: 'h_crosby_street',
    authorName: 'Nadia V.', authorCity: 'Chicago, IL',
    rating: 4, date: '2026-02-14', stayType: 'Anniversary',
    text: 'Private screening room, garden courtyard, exceptional bar program. Very difficult to leave. One minor point — the bar closes at midnight which felt early for a NYC weekend. Still five stars in every other dimension.',
  },

  // ─── The Standard, High Line ────────────────────────────────────────
  {
    id: 'r_stnd_1', hotelId: 'h_standard_highline',
    authorName: 'James P.', authorCity: 'Denver, CO',
    rating: 5, date: '2026-03-20', stayType: 'Friends',
    text: 'Le Bain on Friday night is worth the NightDrop booking alone. Hudson River views from every floor, giant windows in the room, and the Biergarten downstairs is a perfect post-High Line stop.',
  },
  {
    id: 'r_stnd_2', hotelId: 'h_standard_highline',
    authorName: 'Lin C.', authorCity: 'San Francisco, CA',
    rating: 4, date: '2026-02-08', stayType: 'Solo',
    text: 'Great Meatpacking District location. The views are as good as advertised. Le Bain can get loud on weekends — ask for a room above the 8th floor. But if you are there for the scene, you will love it.',
  },
  {
    id: 'r_stnd_3', hotelId: 'h_standard_highline',
    authorName: 'Rachel G.', authorCity: 'Austin, TX',
    rating: 5, date: '2026-01-30', stayType: 'Couple',
    text: 'We had the best brunch at the Standard\'s dining room, took a walk on the High Line, came back for a swim in the rooftop pool. NightDrop was 38% off the listed rate. Absolute steal for this hotel.',
  },

  // ─── The Beekman ────────────────────────────────────────────────────
  {
    id: 'r_beek_1', hotelId: 'h_beekman_nyc',
    authorName: 'Nathan B.', authorCity: 'Boston, MA',
    rating: 5, date: '2026-03-12', stayType: 'Couple',
    text: 'The nine-story Victorian glass atrium is one of the most stunning hotel interiors in America. Tom Colicchio\'s Temple Court is exceptional — order the duck. Worth every dollar of the NightDrop price.',
  },
  {
    id: 'r_beek_2', hotelId: 'h_beekman_nyc',
    authorName: 'Zoe F.', authorCity: 'Philadelphia, PA',
    rating: 5, date: '2026-02-20', stayType: 'Anniversary',
    text: '1881 architecture that makes you feel like you\'ve stepped out of time — in the best possible way. Bar Beekman has the most inventive cocktail menu in FiDi. Our room had the original cast-iron windows. Unforgettable.',
  },
  {
    id: 'r_beek_3', hotelId: 'h_beekman_nyc',
    authorName: 'Connor M.', authorCity: 'Minneapolis, MN',
    rating: 4, date: '2026-01-05', stayType: 'Business',
    text: 'Historic and well-executed. If you\'re doing meetings in the Financial District this is the obvious choice. The atrium is a genuinely impressive place to work from the lobby. Slight knock: valet is slow.',
  },

  // ─── The Cosmopolitan ───────────────────────────────────────────────
  {
    id: 'r_cosmo_1', hotelId: 'h_cosmopolitan_lv',
    authorName: 'Carlos V.', authorCity: 'Houston, TX',
    rating: 5, date: '2026-03-30', stayType: 'Friends',
    text: 'Got this as a Top Secret and when the Cosmopolitan revealed I nearly dropped my phone. The terrace room with Strip views at that price is obscene. Wicked Spoon is the best buffet on the Strip by a mile.',
  },
  {
    id: 'r_cosmo_2', hotelId: 'h_cosmopolitan_lv',
    authorName: 'Diana P.', authorCity: 'Chicago, IL',
    rating: 5, date: '2026-02-22', stayType: 'Couple',
    text: 'The Cosmo manages to feel boutique even at 3,000 rooms. Boulevard Pool is beautiful. The hammam spa experience was world-class. NightDrop had us paying under $300 for a property that charges $600 on weekends.',
  },
  {
    id: 'r_cosmo_3', hotelId: 'h_cosmopolitan_lv',
    authorName: 'Kevin L.', authorCity: 'Phoenix, AZ',
    rating: 4, date: '2026-01-08', stayType: 'Business',
    text: 'Stayed during CES — the hotel managed volume remarkably well, no degraded service. Marquee nightclub from the room is audible on lower floors. Chelsea casino is less overwhelming than MGM properties. Very solid.',
  },

  // ─── Wynn Las Vegas ─────────────────────────────────────────────────
  {
    id: 'r_wynn_1', hotelId: 'h_wynn_lv',
    authorName: 'Olivia H.', authorCity: 'San Diego, CA',
    rating: 5, date: '2026-03-05', stayType: 'Couple',
    text: 'The Wynn is the gold standard. Tower Suites pool is the most elegant pool experience in Vegas — no rowdy crowds, impeccable service. Lakeside is spectacular for dinner. The NightDrop rate felt genuinely too good.',
  },
  {
    id: 'r_wynn_2', hotelId: 'h_wynn_lv',
    authorName: 'Mark J.', authorCity: 'Salt Lake City, UT',
    rating: 4, date: '2026-02-02', stayType: 'Business',
    text: 'Came for a conference and stayed an extra night because the room was that good. The bed is the softest thing I\'ve ever slept in. Golf course access at that quality in the middle of Vegas is genuinely unique.',
  },

  // ─── Sunset Tower Hotel ─────────────────────────────────────────────
  {
    id: 'r_sunset_1', hotelId: 'h_sunset_tower',
    authorName: 'Julia A.', authorCity: 'New York, NY',
    rating: 5, date: '2026-04-05', stayType: 'Anniversary',
    text: 'Hollywood legend made real. The Tower Bar lunch table looked directly over the city. Rooftop pool is small but exclusively peaceful. Our NightDrop Top Secret reveal was one of the best surprises of a trip.',
  },
  {
    id: 'r_sunset_2', hotelId: 'h_sunset_tower',
    authorName: 'Michael C.', authorCity: 'San Francisco, CA',
    rating: 5, date: '2026-03-10', stayType: 'Business',
    text: 'The Tower Bar is exactly what it\'s legendary for. Great for an industry lunch or a late dinner. The 1929 Art Deco bones make every corner photogenic. One of the few hotels in WeHo with genuine character and history.',
  },
  {
    id: 'r_sunset_3', hotelId: 'h_sunset_tower',
    authorName: 'Chloe D.', authorCity: 'Atlanta, GA',
    rating: 4, date: '2026-02-18', stayType: 'Couple',
    text: 'Glamorous without being flashy about it. Room was beautifully appointed. The rooftop pool has iconic Sunset Strip views. Booked as a Top Secret deal — could not believe it when it revealed. Highly recommend.',
  },

  // ─── The LINE Hotel LA ──────────────────────────────────────────────
  {
    id: 'r_line_1', hotelId: 'h_line_la',
    authorName: 'Tyler R.', authorCity: 'Austin, TX',
    rating: 5, date: '2026-03-28', stayType: 'Friends',
    text: 'Ktown has the best food in LA and The LINE puts you right in it. Openaire rooftop pool is outstanding — you can see the Hollywood sign from the deck chairs. NightDrop rate was incredibly reasonable for this quality.',
  },
  {
    id: 'r_line_2', hotelId: 'h_line_la',
    authorName: 'Kim S.', authorCity: 'Portland, OR',
    rating: 4, date: '2026-02-25', stayType: 'Solo',
    text: 'The glass-block 1964 architecture is genuinely cool. Vinyl library was a surprisingly good touch. The Ktown BBQ restaurant downstairs is excellent and open late. Compact room but everything you need.',
  },

  // ─── Proper Hotel SF ────────────────────────────────────────────────
  {
    id: 'r_proper_1', hotelId: 'h_proper_sf',
    authorName: 'Brian Y.', authorCity: 'New York, NY',
    rating: 5, date: '2026-03-22', stayType: 'Business',
    text: 'Kelly Wearstler did something special here. Every room is a different color story and they all work. Villon rooftop bar is the best view in SF. NightDrop had the property at 30% off on a Tuesday — absurd value.',
  },
  {
    id: 'r_proper_2', hotelId: 'h_proper_sf',
    authorName: 'Fiona L.', authorCity: 'Seattle, WA',
    rating: 5, date: '2026-02-12', stayType: 'Couple',
    text: 'La Bande restaurant is outstanding for dinner — the scallops were remarkable. Wellness floor had a cold plunge and sauna that we used twice a day. The vintage furniture and curated art make every room feel like a gallery.',
  },
  {
    id: 'r_proper_3', hotelId: 'h_proper_sf',
    authorName: 'David O.', authorCity: 'Los Angeles, CA',
    rating: 4, date: '2026-01-27', stayType: 'Solo',
    text: 'Mid-Market location worried me but it was completely fine — very walkable. The Proper is the best hotel I\'ve stayed at in SF. The rooftop bar has the kind of view that makes you want to stay another night.',
  },

  // ─── Hotel Zelos SF ─────────────────────────────────────────────────
  {
    id: 'r_zelos_1', hotelId: 'h_hotel_zelos_sf',
    authorName: 'Anna T.', authorCity: 'Boston, MA',
    rating: 5, date: '2026-03-18', stayType: 'Couple',
    text: 'Dirty Habit bar and restaurant is reason enough to book this hotel. The moody, speakeasy aesthetic throughout the building is very well done. Union Square location put everything in walking distance. Great NightDrop rate.',
  },
  {
    id: 'r_zelos_2', hotelId: 'h_hotel_zelos_sf',
    authorName: 'Patrick H.', authorCity: 'Chicago, IL',
    rating: 4, date: '2026-02-05', stayType: 'Business',
    text: 'Reliable, comfortable, well-located. The Bose sound system in the room is a nice touch for working late. Evening turndown with local Ghirardelli chocolates is a small but memorable detail. Would return.',
  },

  // ─── The Gwen Chicago ───────────────────────────────────────────────
  {
    id: 'r_gwen_1', hotelId: 'h_gwen_chicago',
    authorName: 'Clara S.', authorCity: 'San Francisco, CA',
    rating: 5, date: '2026-03-25', stayType: 'Girls Trip',
    text: 'Cabra is one of the best Peruvian restaurants I\'ve had anywhere. The rooftop views of Lake Shore Drive and Lake Michigan are stunning. The hotel spa is superb. NightDrop made this an affordable splurge for all four of us.',
  },
  {
    id: 'r_gwen_2', hotelId: 'h_gwen_chicago',
    authorName: 'Ryan J.', authorCity: 'Washington, DC',
    rating: 4, date: '2026-02-28', stayType: 'Business',
    text: 'Magnificent Mile location is excellent for Chicago business trips — easy access to the Loop, great walkability. The Art Deco exterior is impressive. Club lounge breakfast is above average for the category.',
  },

  // ─── Hyatt Regency Bellevue ─────────────────────────────────────────
  {
    id: 'r_hyatt_bel1', hotelId: 'h_hyatt_bellevue',
    authorName: 'James O.', authorCity: 'Seattle, WA',
    rating: 5, date: '2026-03-22', stayType: 'Business',
    text: 'The direct skybridge to Bellevue Square is an underrated perk — I finished a dinner meeting and was back in my room in under two minutes. Rooms are spacious, beds are excellent, and the Regency Club lounge is genuinely good. NightDrop had it almost 40% off rack rate.',
  },
  {
    id: 'r_hyatt_bel2', hotelId: 'h_hyatt_bellevue',
    authorName: 'Sarah K.', authorCity: 'Portland, OR',
    rating: 4, date: '2026-02-14', stayType: 'Couple',
    text: 'Came up for a Valentine\'s weekend and was impressed. The hotel is massive but never felt impersonal. Lincoln South Kitchen has solid happy hour specials and the city-view rooms at this price point are hard to beat in the Eastside.',
  },
  {
    id: 'r_hyatt_bel3', hotelId: 'h_hyatt_bellevue',
    authorName: 'Ryan C.', authorCity: 'San Jose, CA',
    rating: 4, date: '2026-01-30', stayType: 'Business',
    text: 'Perfect for tech conferences in Bellevue. The conference facilities are top-tier and the rooms are quiet despite the size of the property. Got it on NightDrop for a last-minute Microsoft meeting and it was genuinely good value.',
  },

  // ─── W Bellevue ─────────────────────────────────────────────────────
  {
    id: 'r_w_bel1', hotelId: 'h_w_bellevue',
    authorName: 'Alexis M.', authorCity: 'Los Angeles, CA',
    rating: 5, date: '2026-03-08', stayType: 'Couple',
    text: 'Didn\'t expect Bellevue to have a hotel this cool. The WXYZ Bar has a serious cocktail program and the Whatever/Whenever service is actually responsive — they found me a late-night ramen spot at midnight and had the address texted in ten minutes. Spectacular rooms.',
  },
  {
    id: 'r_w_bel2', hotelId: 'h_w_bellevue',
    authorName: 'Nina P.', authorCity: 'New York, NY',
    rating: 5, date: '2026-02-20', stayType: 'Business',
    text: 'The W has a completely different energy from every other Bellevue hotel — it feels like a hotel that belongs in a major metro. The heated pool deck is stunning, the gym is proper (not hotel-gym), and the rooms are some of the nicest I\'ve stayed in anywhere. NightDrop price was exceptional.',
  },

  // ─── Nobu Hotel Chicago ─────────────────────────────────────────────
  {
    id: 'r_nobu_ch1', hotelId: 'h_nobu_chicago',
    authorName: 'Mia T.', authorCity: 'Toronto, ON',
    rating: 5, date: '2026-01-18', stayType: 'Couple',
    text: 'Nobu Restaurant Chicago is as good as the LA or NY original. The hotel rooms are as polished as you\'d expect — minimalist Japanese aesthetic with incredibly comfortable beds. NightDrop had it 35% off. Booked immediately.',
  },
  {
    id: 'r_nobu_ch2', hotelId: 'h_nobu_chicago',
    authorName: 'Helena R.', authorCity: 'New York, NY',
    rating: 5, date: '2026-03-16', stayType: 'Business',
    text: 'West Loop is the best neighborhood in Chicago right now and Nobu is the best address in West Loop. The personal shopper service is something I\'ve never seen at this price point. Exceptional across the board.',
  },
];

// Pre-computed rating summaries keyed by hotelId for quick lookup.
export function buildRatingSummaries(reviews) {
  const summaries = {};
  for (const r of reviews) {
    if (!summaries[r.hotelId]) summaries[r.hotelId] = { total: 0, count: 0 };
    summaries[r.hotelId].total += r.rating;
    summaries[r.hotelId].count += 1;
  }
  const result = {};
  for (const [id, s] of Object.entries(summaries)) {
    result[id] = { avg: +(s.total / s.count).toFixed(1), count: s.count };
  }
  return result;
}
