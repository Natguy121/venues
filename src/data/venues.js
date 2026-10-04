// Sample venue catalogue (Lebanon). Venues are fictional; photos are Unsplash stock images.
// This module is the only place the app reads venue data from (via src/api.js),
// so it can be swapped for a real backend without touching the UI.
export const venues = [
  {
    "id": "sky-gemmayzeh",
    "name": "Sky Gemmayzeh",
    "type": "Rooftop",
    "city": "Beirut",
    "area": "Gemmayzeh",
    "address": "Rue Gouraud, Gemmayzeh, Beirut",
    "lat": 33.8959,
    "lng": 35.514,
    "pricePerPerson": 45,
    "minGuests": 10,
    "maxGuests": 90,
    "kidFriendly": false,
    "rating": 4.7,
    "description": "Rooftop lounge above Gemmayzeh's stairs with city and sea views, a private bar and late-night DJ sets.",
    "includes": [
      "Private bar area",
      "Mezze & canapés",
      "DJ set",
      "Birthday cake service"
    ],
    "images": [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-06", "2026-10-08", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13",
      "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-21", "2026-10-23",
      "2026-10-26", "2026-10-28", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02",
      "2026-11-03", "2026-11-04", "2026-11-13", "2026-11-14", "2026-11-17", "2026-11-19",
      "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23", "2026-11-26", "2026-11-28",
      "2026-11-30", "2026-12-03", "2026-12-05", "2026-12-06", "2026-12-08", "2026-12-11",
      "2026-12-12", "2026-12-13", "2026-12-16", "2026-12-18", "2026-12-19", "2026-12-23",
      "2026-12-26", "2026-12-27", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-13",
      "2027-01-15", "2027-01-16", "2027-01-21", "2027-01-22", "2027-01-23", "2027-01-24",
      "2027-01-25", "2027-01-29", "2027-01-30", "2027-02-02", "2027-02-04", "2027-02-06",
      "2027-02-07", "2027-02-10", "2027-02-12", "2027-02-14", "2027-02-15", "2027-02-17",
      "2027-02-19", "2027-02-21", "2027-02-23", "2027-02-24", "2027-02-25"
    ]
  },
  {
    "id": "mar-mikhael-bowl",
    "name": "Mar Mikhael Bowl",
    "type": "Bowling",
    "city": "Beirut",
    "area": "Mar Mikhael",
    "address": "Armenia Street, Mar Mikhael, Beirut",
    "lat": 33.8977,
    "lng": 35.523,
    "pricePerPerson": 22,
    "minGuests": 6,
    "maxGuests": 60,
    "kidFriendly": true,
    "rating": 4.5,
    "description": "Retro bowling lanes with neon lights and a party room for cake and presents.",
    "includes": [
      "2 hours of bowling",
      "Shoe rental",
      "Manakish & soft drinks",
      "Party room"
    ],
    "images": [
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-09", "2026-10-11", "2026-10-12", "2026-10-15", "2026-10-20", "2026-10-22",
      "2026-10-30", "2026-11-03", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08",
      "2026-11-09", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-15", "2026-11-21",
      "2026-11-22", "2026-11-23", "2026-11-25", "2026-11-27", "2026-11-28", "2026-11-29",
      "2026-11-30", "2026-12-04", "2026-12-05", "2026-12-06", "2026-12-08", "2026-12-10",
      "2026-12-11", "2026-12-12", "2026-12-16", "2026-12-18", "2026-12-19", "2026-12-20",
      "2026-12-25", "2026-12-26", "2026-12-28", "2026-12-30", "2027-01-01", "2027-01-03",
      "2027-01-09", "2027-01-10", "2027-01-16", "2027-01-17", "2027-01-18", "2027-01-22",
      "2027-01-23", "2027-01-24", "2027-01-31", "2027-02-02", "2027-02-08", "2027-02-10",
      "2027-02-12", "2027-02-13", "2027-02-16", "2027-02-19", "2027-02-20", "2027-02-24",
      "2027-02-26", "2027-02-27", "2027-02-28", "2027-03-02"
    ]
  },
  {
    "id": "beit-hamra",
    "name": "Beit Hamra",
    "type": "Private dining",
    "city": "Beirut",
    "area": "Hamra",
    "address": "Makdessi Street, Hamra, Beirut",
    "lat": 33.896,
    "lng": 35.4825,
    "pricePerPerson": 38,
    "minGuests": 8,
    "maxGuests": 35,
    "kidFriendly": true,
    "rating": 4.9,
    "description": "A restored Lebanese house with a private dining room serving a family-style mezze and grill menu.",
    "includes": [
      "Full mezze & mashawi",
      "Personalised menus",
      "Bring your own cake",
      "Dedicated host"
    ],
    "images": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-15", "2026-10-17", "2026-10-18",
      "2026-10-19", "2026-10-21", "2026-10-24", "2026-10-25", "2026-10-28", "2026-10-30",
      "2026-10-31", "2026-11-06", "2026-11-08", "2026-11-14", "2026-11-15", "2026-11-21",
      "2026-11-22", "2026-11-24", "2026-11-29", "2026-12-01", "2026-12-04", "2026-12-06",
      "2026-12-08", "2026-12-09", "2026-12-18", "2026-12-19", "2026-12-23", "2026-12-25",
      "2027-01-01", "2027-01-06", "2027-01-08", "2027-01-16", "2027-01-17", "2027-01-22",
      "2027-01-27", "2027-01-28", "2027-01-29", "2027-02-02", "2027-02-03", "2027-02-05",
      "2027-02-06", "2027-02-11", "2027-02-13", "2027-02-17", "2027-02-19", "2027-02-20",
      "2027-02-21", "2027-02-26", "2027-02-27", "2027-02-28", "2027-03-01"
    ]
  },
  {
    "id": "zaitunay-bay-terrace",
    "name": "Zaitunay Bay Terrace",
    "type": "Restaurant",
    "city": "Beirut",
    "area": "Zaitunay Bay",
    "address": "Zaitunay Bay, Beirut Marina",
    "lat": 33.901,
    "lng": 35.4955,
    "pricePerPerson": 55,
    "minGuests": 10,
    "maxGuests": 80,
    "kidFriendly": true,
    "rating": 4.6,
    "description": "Marina-front terrace with yacht views, seafood sharing platters and sunset sparkler cakes.",
    "includes": [
      "3-course seafood menu",
      "Reserved terrace",
      "Sparkler cake service",
      "Mocktails for kids"
    ],
    "images": [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-07", "2026-10-09", "2026-10-11", "2026-10-13", "2026-10-16", "2026-10-17",
      "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-25",
      "2026-10-26", "2026-10-27", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01",
      "2026-11-02", "2026-11-04", "2026-11-05", "2026-11-07", "2026-11-08", "2026-11-13",
      "2026-11-14", "2026-11-15", "2026-11-20", "2026-11-22", "2026-11-24", "2026-11-26",
      "2026-11-28", "2026-11-29", "2026-11-30", "2026-12-03", "2026-12-05", "2026-12-06",
      "2026-12-11", "2026-12-12", "2026-12-13", "2026-12-15", "2026-12-17", "2026-12-18",
      "2026-12-19", "2026-12-20", "2026-12-23", "2026-12-24", "2026-12-25", "2026-12-26",
      "2026-12-27", "2026-12-28", "2027-01-02", "2027-01-03", "2027-01-05", "2027-01-06",
      "2027-01-07", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-12", "2027-01-14",
      "2027-01-15", "2027-01-16", "2027-01-18", "2027-01-19", "2027-01-20", "2027-01-22",
      "2027-01-23", "2027-01-24", "2027-01-25", "2027-01-27", "2027-01-28", "2027-01-29",
      "2027-01-30", "2027-01-31", "2027-02-01", "2027-02-03", "2027-02-04", "2027-02-12",
      "2027-02-13", "2027-02-14", "2027-02-16", "2027-02-17", "2027-02-19", "2027-02-20",
      "2027-02-26", "2027-02-27", "2027-02-28", "2027-03-02", "2027-03-03"
    ]
  },
  {
    "id": "funland-dbayeh",
    "name": "FunLand Dbayeh",
    "type": "Kids play center",
    "city": "Dbayeh",
    "area": "Waterfront",
    "address": "Dbayeh Highway, Metn",
    "lat": 33.937,
    "lng": 35.588,
    "pricePerPerson": 18,
    "minGuests": 10,
    "maxGuests": 50,
    "kidFriendly": true,
    "rating": 4.8,
    "description": "Trampolines, soft play and a ninja course, plus a decorated party room with a dedicated host.",
    "includes": [
      "90 min play time",
      "Party host",
      "Pizza & juice",
      "Goodie bags"
    ],
    "images": [
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-11", "2026-10-13", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18",
      "2026-10-20", "2026-10-23", "2026-10-27", "2026-10-30", "2026-10-31", "2026-11-01",
      "2026-11-02", "2026-11-03", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09",
      "2026-11-11", "2026-11-13", "2026-11-14", "2026-11-15", "2026-11-19", "2026-11-22",
      "2026-11-25", "2026-11-27", "2026-11-29", "2026-11-30", "2026-12-04", "2026-12-05",
      "2026-12-08", "2026-12-09", "2026-12-10", "2026-12-11", "2026-12-13", "2026-12-16",
      "2026-12-17", "2026-12-18", "2026-12-20", "2026-12-21", "2026-12-27", "2026-12-29",
      "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-04",
      "2027-01-06", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-12", "2027-01-13",
      "2027-01-15", "2027-01-16", "2027-01-17", "2027-01-19", "2027-01-20", "2027-01-21",
      "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-27", "2027-01-28", "2027-01-29",
      "2027-01-30", "2027-01-31", "2027-02-06", "2027-02-07", "2027-02-10", "2027-02-11",
      "2027-02-13", "2027-02-14", "2027-02-16", "2027-02-18", "2027-02-20", "2027-02-21",
      "2027-02-22", "2027-02-23", "2027-02-25", "2027-02-26", "2027-02-27", "2027-02-28",
      "2027-03-01"
    ]
  },
  {
    "id": "jounieh-bay-lounge",
    "name": "Jounieh Bay Lounge",
    "type": "Bar & lounge",
    "city": "Jounieh",
    "area": "Maameltein",
    "address": "Maameltein Highway, Jounieh",
    "lat": 33.9925,
    "lng": 35.6265,
    "pricePerPerson": 40,
    "minGuests": 8,
    "maxGuests": 70,
    "kidFriendly": false,
    "rating": 4.3,
    "description": "Seafront lounge overlooking Jounieh Bay with VIP booths, live DJ and bottle service.",
    "includes": [
      "VIP booth",
      "Welcome cocktail",
      "Live DJ",
      "Birthday bottle parade"
    ],
    "images": [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-05", "2026-10-06", "2026-10-09", "2026-10-11", "2026-10-14", "2026-10-16",
      "2026-10-25", "2026-10-26", "2026-10-29", "2026-10-31", "2026-11-01", "2026-11-04",
      "2026-11-06", "2026-11-08", "2026-11-09", "2026-11-10", "2026-11-14", "2026-11-15",
      "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-26", "2026-11-28",
      "2026-11-29", "2026-12-01", "2026-12-04", "2026-12-08", "2026-12-11", "2026-12-13",
      "2026-12-20", "2026-12-22", "2026-12-23", "2026-12-24", "2026-12-25", "2027-01-01",
      "2027-01-02", "2027-01-03", "2027-01-05", "2027-01-06", "2027-01-08", "2027-01-11",
      "2027-01-12", "2027-01-14", "2027-01-15", "2027-01-16", "2027-01-18", "2027-01-19",
      "2027-01-21", "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-25", "2027-01-26",
      "2027-01-29", "2027-01-30", "2027-01-31", "2027-02-01", "2027-02-02", "2027-02-03",
      "2027-02-04", "2027-02-06", "2027-02-12", "2027-02-13", "2027-02-15", "2027-02-16",
      "2027-02-19", "2027-02-20", "2027-02-21", "2027-02-22", "2027-02-23", "2027-02-24",
      "2027-02-25", "2027-02-27", "2027-02-28", "2027-03-01", "2027-03-02"
    ]
  },
  {
    "id": "kaslik-karaoke",
    "name": "Kaslik Karaoke Box",
    "type": "Karaoke",
    "city": "Jounieh",
    "area": "Kaslik",
    "address": "Kaslik Main Road, Jounieh",
    "lat": 33.98,
    "lng": 35.618,
    "pricePerPerson": 20,
    "minGuests": 4,
    "maxGuests": 25,
    "kidFriendly": true,
    "rating": 4.4,
    "description": "Private soundproof karaoke rooms with Arabic, French and English songs and room service.",
    "includes": [
      "3-hour private room",
      "Snack platter",
      "Unlimited soft drinks",
      "Birthday song intro"
    ],
    "images": [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-11", "2026-10-12",
      "2026-10-17", "2026-10-18", "2026-10-20", "2026-10-24", "2026-10-25", "2026-10-29",
      "2026-10-30", "2026-10-31", "2026-11-04", "2026-11-05", "2026-11-07", "2026-11-08",
      "2026-11-14", "2026-11-15", "2026-11-17", "2026-11-19", "2026-11-20", "2026-11-21",
      "2026-11-23", "2026-11-26", "2026-11-29", "2026-12-03", "2026-12-05", "2026-12-06",
      "2026-12-09", "2026-12-11", "2026-12-20", "2026-12-21", "2026-12-24", "2026-12-25",
      "2026-12-26", "2026-12-27", "2026-12-29", "2026-12-31", "2027-01-01", "2027-01-02",
      "2027-01-03", "2027-01-04", "2027-01-06", "2027-01-07", "2027-01-08", "2027-01-09",
      "2027-01-10", "2027-01-13", "2027-01-15", "2027-01-16", "2027-01-17", "2027-01-18",
      "2027-01-19", "2027-01-20", "2027-01-25", "2027-01-27", "2027-01-30", "2027-02-05",
      "2027-02-06", "2027-02-09", "2027-02-12", "2027-02-13", "2027-02-15", "2027-02-16",
      "2027-02-17", "2027-02-18", "2027-02-19", "2027-02-20", "2027-02-21", "2027-02-22",
      "2027-02-24", "2027-02-25", "2027-02-27", "2027-03-03"
    ]
  },
  {
    "id": "byblos-old-souk-garden",
    "name": "Old Souk Garden",
    "type": "Restaurant",
    "city": "Byblos",
    "area": "Old Souk",
    "address": "Old Souk, Jbeil",
    "lat": 34.121,
    "lng": 35.648,
    "pricePerPerson": 32,
    "minGuests": 6,
    "maxGuests": 60,
    "kidFriendly": true,
    "rating": 4.8,
    "description": "Garden restaurant under string lights in the old souk, a short walk from the ancient harbour.",
    "includes": [
      "Family-style dinner",
      "Reserved garden",
      "Lawn games",
      "Cake cutting"
    ],
    "images": [
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-05", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-13",
      "2026-10-14", "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-22", "2026-10-24",
      "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02", "2026-11-06", "2026-11-07",
      "2026-11-08", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15", "2026-11-18",
      "2026-11-21", "2026-11-25", "2026-11-27", "2026-11-28", "2026-11-29", "2026-12-06",
      "2026-12-08", "2026-12-10", "2026-12-11", "2026-12-13", "2026-12-18", "2026-12-19",
      "2026-12-20", "2026-12-21", "2026-12-22", "2026-12-25", "2026-12-27", "2027-01-01",
      "2027-01-02", "2027-01-03", "2027-01-06", "2027-01-08", "2027-01-10", "2027-01-16",
      "2027-01-17", "2027-01-22", "2027-01-24", "2027-01-30", "2027-01-31", "2027-02-06",
      "2027-02-11", "2027-02-13", "2027-02-19", "2027-02-21", "2027-02-25", "2027-02-26",
      "2027-02-27", "2027-02-28", "2027-03-03"
    ]
  },
  {
    "id": "batroun-beach-club",
    "name": "Batroun Beach Club",
    "type": "Event space",
    "city": "Batroun",
    "area": "Seafront",
    "address": "Batroun Coastal Road",
    "lat": 34.255,
    "lng": 35.658,
    "pricePerPerson": 35,
    "minGuests": 15,
    "maxGuests": 200,
    "kidFriendly": false,
    "rating": 4.5,
    "description": "Beach club with a private deck, live band and BBQ for big sunset birthday parties.",
    "includes": [
      "Private deck",
      "Live band set",
      "BBQ buffet",
      "Beach bonfire"
    ],
    "images": [
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-05", "2026-10-09", "2026-10-11", "2026-10-16", "2026-10-17", "2026-10-22",
      "2026-10-24", "2026-10-25", "2026-10-30", "2026-11-06", "2026-11-07", "2026-11-08",
      "2026-11-14", "2026-11-15", "2026-11-19", "2026-11-20", "2026-11-22", "2026-11-24",
      "2026-12-05", "2026-12-06", "2026-12-09", "2026-12-11", "2026-12-12", "2026-12-13",
      "2026-12-18", "2026-12-19", "2026-12-20", "2026-12-25", "2026-12-26", "2027-01-01",
      "2027-01-02", "2027-01-03", "2027-01-07", "2027-01-09", "2027-01-10", "2027-01-15",
      "2027-01-17", "2027-01-22", "2027-01-23", "2027-01-26", "2027-01-27", "2027-01-30",
      "2027-02-02", "2027-02-07", "2027-02-14", "2027-02-16", "2027-02-26", "2027-02-27"
    ]
  },
  {
    "id": "broummana-pine-loft",
    "name": "Pine Loft Broummana",
    "type": "Event space",
    "city": "Broummana",
    "area": "Main Street",
    "address": "Broummana Main Street, Metn",
    "lat": 33.883,
    "lng": 35.621,
    "pricePerPerson": 30,
    "minGuests": 20,
    "maxGuests": 150,
    "kidFriendly": true,
    "rating": 4.5,
    "description": "Mountain loft among the pines with a stage, fireplace and flexible layouts for big celebrations.",
    "includes": [
      "Exclusive use (5 hrs)",
      "Sound system",
      "Tables & linens",
      "Buffet dinner"
    ],
    "images": [
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-16", "2026-10-17", "2026-10-18",
      "2026-10-20", "2026-10-21", "2026-10-25", "2026-10-27", "2026-11-01", "2026-11-06",
      "2026-11-08", "2026-11-09", "2026-11-12", "2026-11-14", "2026-11-15", "2026-11-18",
      "2026-11-19", "2026-11-21", "2026-11-23", "2026-11-27", "2026-11-28", "2026-11-29",
      "2026-12-04", "2026-12-05", "2026-12-06", "2026-12-09", "2026-12-11", "2026-12-12",
      "2026-12-13", "2026-12-16", "2026-12-18", "2026-12-19", "2026-12-20", "2026-12-22",
      "2026-12-23", "2026-12-26", "2026-12-27", "2026-12-28", "2026-12-31", "2027-01-02",
      "2027-01-04", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-11", "2027-01-16",
      "2027-01-19", "2027-01-20", "2027-01-21", "2027-01-25", "2027-01-29", "2027-01-30",
      "2027-02-03", "2027-02-07", "2027-02-09", "2027-02-13", "2027-02-20", "2027-02-21",
      "2027-02-22", "2027-02-26", "2027-02-27", "2027-02-28", "2027-03-03"
    ]
  },
  {
    "id": "tripoli-escape",
    "name": "The Citadel Escape",
    "type": "Escape room",
    "city": "Tripoli",
    "area": "El Mina",
    "address": "El Mina, Tripoli",
    "lat": 34.45,
    "lng": 35.815,
    "pricePerPerson": 15,
    "minGuests": 4,
    "maxGuests": 24,
    "kidFriendly": true,
    "rating": 4.7,
    "description": "Three history-themed escape rooms that can run head-to-head, with a lounge for cake afterwards.",
    "includes": [
      "60-minute game",
      "Team photo",
      "Party lounge (45 min)",
      "Soft drinks"
    ],
    "images": [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-06", "2026-10-09", "2026-10-11", "2026-10-16", "2026-10-17", "2026-10-18",
      "2026-10-20", "2026-10-21", "2026-10-23", "2026-10-24", "2026-11-01", "2026-11-05",
      "2026-11-06", "2026-11-08", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15",
      "2026-11-20", "2026-11-23", "2026-11-27", "2026-11-28", "2026-11-29", "2026-12-01",
      "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06", "2026-12-08", "2026-12-09",
      "2026-12-10", "2026-12-11", "2026-12-12", "2026-12-18", "2026-12-19", "2026-12-20",
      "2026-12-25", "2026-12-26", "2026-12-29", "2026-12-31", "2027-01-03", "2027-01-04",
      "2027-01-06", "2027-01-08", "2027-01-10", "2027-01-15", "2027-01-17", "2027-01-18",
      "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-28", "2027-01-29", "2027-02-03",
      "2027-02-05", "2027-02-06", "2027-02-07", "2027-02-11", "2027-02-12", "2027-02-13",
      "2027-02-14", "2027-02-16", "2027-02-19", "2027-02-20", "2027-02-21", "2027-02-26",
      "2027-02-27"
    ]
  },
  {
    "id": "zahle-berdawni",
    "name": "Berdawni Riverside",
    "type": "Restaurant",
    "city": "Zahle",
    "area": "Berdawni",
    "address": "Berdawni River, Zahle",
    "lat": 33.85,
    "lng": 35.905,
    "pricePerPerson": 28,
    "minGuests": 10,
    "maxGuests": 120,
    "kidFriendly": true,
    "rating": 4.6,
    "description": "Classic riverside restaurant with a shaded terrace, full mezze spread and live oud.",
    "includes": [
      "Full mezze",
      "Riverside terrace",
      "Live oud player",
      "Cake service"
    ],
    "images": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70"
    ],
    "availability": [
      "2026-10-08", "2026-10-11", "2026-10-14", "2026-10-18", "2026-10-24", "2026-10-25",
      "2026-10-26", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-04", "2026-11-07",
      "2026-11-08", "2026-11-13", "2026-11-14", "2026-11-18", "2026-11-21", "2026-11-22",
      "2026-11-28", "2026-12-02", "2026-12-10", "2026-12-11", "2026-12-12", "2026-12-19",
      "2026-12-20", "2026-12-26", "2027-01-01", "2027-01-02", "2027-01-04", "2027-01-07",
      "2027-01-08", "2027-01-15", "2027-01-18", "2027-01-19", "2027-01-21", "2027-01-22",
      "2027-01-26", "2027-01-29", "2027-02-03", "2027-02-05", "2027-02-06", "2027-02-13",
      "2027-02-16", "2027-02-17", "2027-02-20", "2027-03-03"
    ]
  }
];
