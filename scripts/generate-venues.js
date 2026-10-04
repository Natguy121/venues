// Generates the sample venue catalogue in src/data/venues.js.
//
//   node scripts/generate-venues.js [YYYY-MM-DD]
//
// Venues are fictional but placed in real Lebanese towns (approximate
// coordinates). Availability is generated for the 180 days after the start
// date (default: today), so re-run this to refresh the sample dates.
// Output is deterministic for a given start date.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/venues.js", import.meta.url));
const DAYS = 180;

// ---- Seeded randomness -----------------------------------------------------

function rng(seedText) {
  let seed = 2166136261;
  for (const ch of seedText) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const between = (rand, min, max) => min + Math.floor(rand() * (max - min + 1));
const slug = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---- Photos ----------------------------------------------------------------
// Unsplash photo IDs grouped by theme. Photos are hotlinked from Unsplash's CDN
// under the Unsplash License; run `npm run check:images` to find dead links.

const PHOTOS = {
  restaurant: [
    "1517248135467-4c7edcad34c4", "1555396273-367ea4eb4db5", "1552566626-52f8b828add9",
    "1559339352-11d035aa65de", "1550966871-3ed3cdb5ed0c", "1544148103-0773bf10d330",
    "1590846406792-0adc7f938f1d", "1466978913421-dad2ebd01d17",
  ],
  food: [
    "1414235077428-338989a2e8c0", "1504674900247-0877df9cc836", "1600891964092-4316c288032e",
    "1546069901-ba9599a7e63c", "1540189549336-e6e99c3679fe", "1512621776951-a57141f2eefd",
    "1551218808-94e220e084d2", "1476224203421-9ac39bcb3327",
  ],
  casual: ["1565299624946-b28f40a0ae38", "1513104890138-7c749659a591", "1571091718767-18b5b1457add", "1568901346375-23c9450c58cd"],
  cafe: ["1554118811-1e0d58224f24", "1501339847302-ac426a4a7cbb", "1495474472287-4d71bcdd2085", "1509042239860-f550ce710b93"],
  cake: ["1578985545062-69928b1d9587", "1535141192574-5d4897c12636", "1464349095431-e9a21285b5f3"],
  bar: [
    "1514933651103-005eec06c04b", "1470337458703-46ad1756a187", "1572116469696-31de0f17cc34",
    "1543007630-9710e4a00a20", "1551024709-8f23befc6f87", "1514362545857-3bc16c4c7d1b",
    "1536935338788-846bb9981813", "1566417713940-fe7c737a9ef2",
  ],
  city: ["1477959858617-67f85cf4f1df", "1519501025264-65ba15a82390", "1449824913935-59a10b8d2000"],
  party: [
    "1530103862676-de8c9debad1d", "1464366400600-7168b8af9bc3", "1527529482837-4698179dc6ce",
    "1528605248644-14dd04022da1", "1496337589254-7e19d01cec44", "1513151233558-d860c5398176",
    "1504196606672-aef5c9cefc92",
  ],
  concert: [
    "1492684223066-81342ee5ff30", "1533174072545-7a4b6ad7a6c3", "1501281668745-f7f57925c3b4",
    "1514525253161-7a46d19cd819", "1470229722913-7c0e2dbbafd3", "1540039155733-5bb30b53aa14",
    "1459749411175-04bf5292ceea",
  ],
  event: [
    "1519671482749-fd09be7ccebf", "1511795409834-ef04bbd61622", "1505236858219-8359eb29e329",
    "1464047736614-af63643285bf", "1469371670807-013ccf25f16a", "1465495976277-4387d4b0b4c6",
    "1519225421980-715cb0215aed", "1478146896981-b80fe463b330", "1542332213-31f87348057f",
    "1511285560929-80b456fea0bc",
  ],
  beach: ["1507525428034-b723cf961d3e", "1519046904884-53103b34b206", "1520250497591-112f2f40a3f4"],
  pool: [
    "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d", "1566073771259-6a8506099945",
    "1582719478250-c89cae4dc85b", "1542314831-068cd1dbfeeb", "1551882547-ff40c63fe5fa",
  ],
  mountain: [
    "1506905925346-21bda4d32df4", "1464822759023-fed622ff2c3b", "1470071459604-3b5ec3a7fe05",
    "1441974231531-c6227db76b6e", "1501785888041-af3ef285b470", "1500530855697-b586d89ba3ee",
    "1469474968028-56623f02e42e",
  ],
  wine: ["1510812431401-41d2bd2722f3", "1506377247377-2a5b3b417ebb"],
  kids: [
    "1503454537195-1dcabb73ffb9", "1587654780291-39c9404d746b", "1566576912321-d58ddd7a6088",
    "1596461404969-9ae70f2830c1", "1472162072942-cd5147eb3902",
  ],
  gaming: [
    "1511512578047-dfb367046420", "1542751371-adc38448a05e", "1538481199705-c710c4e965fc",
    "1550745165-9bc0b252726f", "1511882150382-421056c89033",
  ],
  music: ["1516280440614-37939bbacd81", "1493225457124-a3eb161ffa5f", "1511379938547-c1f69419868d"],
  cinema: ["1489599849927-2ee91cede3ba", "1517604931442-7e0c8ed2963c", "1536440136628-849c177e76a1"],
  cooking: ["1556910103-1c02745aae4d", "1556909114-f6e7ad7d3136", "1507048331197-7d4ac70811cf"],
  art: ["1513364776144-60967b0f800f", "1460661419201-fd4cecdf8a8b", "1452802447250-470a88ac82bc"],
  spa: ["1544161515-4ab6ce6db874", "1540555700478-4be289fbecef", "1515377905703-c4788e51af15"],
  yacht: ["1567899378494-47b22a2ae96a"],
  sports: ["1574629810360-7efbbe195018", "1579952363873-27f3bade9f55", "1546519638-68e109498ffc", "1554068865-24cecd4e34b8"],
};
const photoURL = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

/** Three distinct photos: rotate through the themes so neighbours differ. */
function pickPhotos(themes, index) {
  const ids = [];
  for (let i = 0; ids.length < 3 && i < 12; i++) {
    const pool = PHOTOS[themes[i % themes.length]];
    const id = pool[(index + Math.floor(i / themes.length) * 3 + i) % pool.length];
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

// ---- Places ----------------------------------------------------------------

const REGION = { B: "Beirut", ML: "Mount Lebanon", N: "North Lebanon", S: "South Lebanon", BQ: "Bekaa" };
const T = (city, region, lat, lng, areas, ...tags) => ({ city, region: REGION[region], lat, lng, areas, tags });
const TOWNS = [
  T("Beirut", "B", 33.896, 35.4825, ["Hamra", "Makdessi Street", "Clemenceau"], "city"),
  T("Beirut", "B", 33.8959, 35.514, ["Gemmayzeh", "Rue Gouraud"], "city"),
  T("Beirut", "B", 33.8977, 35.523, ["Mar Mikhael", "Armenia Street"], "city"),
  T("Beirut", "B", 33.8886, 35.52, ["Achrafieh", "Sassine", "Monot"], "city"),
  T("Beirut", "B", 33.879, 35.484, ["Verdun", "Rue Verdun"], "city"),
  T("Beirut", "B", 33.8965, 35.5055, ["Downtown", "Saifi Village", "Foch Street"], "city"),
  T("Beirut", "B", 33.875, 35.515, ["Badaro"], "city"),
  T("Beirut", "B", 33.888, 35.4725, ["Raouche", "Corniche"], "city", "coast"),
  T("Beirut", "B", 33.901, 35.4955, ["Zaitunay Bay", "Beirut Marina"], "city", "coast"),
  T("Beirut", "B", 33.9005, 35.489, ["Ain El Mreisseh"], "city", "coast"),
  T("Sin El Fil", "ML", 33.874, 35.537, ["Horsh Tabet", "Main Road"], "city"),
  T("Hazmieh", "ML", 33.851, 35.536, ["Mar Takla", "Main Road"], "city"),
  T("Baabda", "ML", 33.834, 35.544, ["Main Road"], "city"),
  T("Dekwaneh", "ML", 33.882, 35.548, ["Main Road"], "city"),
  T("Jal El Dib", "ML", 33.91, 35.58, ["Seaside Road", "Highway"], "city", "coast"),
  T("Antelias", "ML", 33.915, 35.592, ["Main Square", "Highway"], "city"),
  T("Dbayeh", "ML", 33.937, 35.588, ["Waterfront", "Marina"], "city", "coast"),
  T("Zalka", "ML", 33.906, 35.573, ["Highway"], "city"),
  T("Mansourieh", "ML", 33.857, 35.571, ["Main Road"], "city"),
  T("Broummana", "ML", 33.883, 35.621, ["Main Street", "Pine Hill"], "mountain"),
  T("Beit Mery", "ML", 33.856, 35.598, ["Old Village", "Main Road"], "mountain"),
  T("Bikfaya", "ML", 33.922, 35.676, ["Main Square", "Old Souk"], "mountain"),
  T("Jounieh", "ML", 33.981, 35.618, ["Old Souk", "Maameltein", "Seaside Road"], "city", "coast"),
  T("Kaslik", "ML", 33.98, 35.6185, ["Kaslik Main Road"], "city", "coast"),
  T("Zouk Mosbeh", "ML", 33.95, 35.612, ["Main Road"], "city"),
  T("Adma", "ML", 34.006, 35.645, ["Hillside"], "mountain", "coast"),
  T("Harissa", "ML", 33.982, 35.651, ["Hilltop"], "mountain"),
  T("Faraya", "ML", 34.0167, 35.8333, ["Village Square", "Ski Road"], "mountain"),
  T("Faqra", "ML", 33.993, 35.807, ["Faqra Club Road"], "mountain"),
  T("Byblos", "ML", 34.121, 35.648, ["Old Souk", "Old Harbour", "Seaside"], "coast", "heritage"),
  T("Amchit", "ML", 34.15, 35.648, ["Old Village", "Seaside"], "coast"),
  T("Aley", "ML", 33.806, 35.6, ["Main Street"], "mountain"),
  T("Deir El Qamar", "ML", 33.697, 35.561, ["Midan Square"], "mountain", "heritage"),
  T("Damour", "ML", 33.73, 35.45, ["Coastal Road"], "coast"),
  T("Jiyeh", "ML", 33.65, 35.41, ["Coastal Road"], "coast"),
  T("Khaldeh", "ML", 33.78, 35.47, ["Coastal Road"], "coast"),
  T("Batroun", "N", 34.255, 35.658, ["Old Souk", "Seafront", "Phoenician Wall"], "coast", "heritage"),
  T("Chekka", "N", 34.33, 35.73, ["Seaside"], "coast"),
  T("Tripoli", "N", 34.436, 35.849, ["Mina Road", "Old City", "Azmi Street"], "city", "heritage"),
  T("El Mina", "N", 34.45, 35.815, ["Corniche", "Old Port"], "city", "coast"),
  T("Ehden", "N", 34.29, 35.97, ["Midan", "Horsh Ehden"], "mountain"),
  T("Bsharri", "N", 34.251, 36.011, ["Main Road"], "mountain"),
  T("The Cedars", "N", 34.243, 36.049, ["Arz Road"], "mountain"),
  T("Saida", "S", 33.563, 35.371, ["Old Souk", "Corniche"], "city", "coast", "heritage"),
  T("Tyre", "S", 33.273, 35.194, ["Old Port", "Beach Road"], "city", "coast", "heritage"),
  T("Jezzine", "S", 33.542, 35.585, ["Waterfall Road"], "mountain"),
  T("Zahle", "BQ", 33.85, 35.905, ["Berdawni", "Boulevard"], "city", "bekaa"),
  T("Chtaura", "BQ", 33.82, 35.85, ["Main Road"], "bekaa"),
  T("Ksara", "BQ", 33.83, 35.89, ["Vineyard Road"], "bekaa"),
  T("Baalbek", "BQ", 34.006, 36.211, ["Temple Road"], "bekaa", "heritage"),
];

// ---- Venue templates -------------------------------------------------------
// {town} and {area} are filled in per venue.

const TYPES = [
  {
    type: "Restaurant", count: 10, tags: ["city", "coast", "heritage"], price: [22, 55], guests: [6, 20, 40, 120], kids: 0.85,
    photos: ["restaurant", "food", "cake"],
    names: ["Mezze House", "Beit Teta", "Al Sanawbar", "Saj & Co", "Zaatar Table", "The Olive Press", "Fattoush Garden",
      "Sea Salt Grill", "Al Mina Fish House", "Kebbeh & Arak", "Armenian Corner", "Pomegranate", "Lemon Tree Kitchen"],
    descriptions: [
      "Family-run Lebanese restaurant in {area} with a long table for birthdays and a full mezze spread.",
      "Lively {town} restaurant known for grilled meats, warm bread from the oven and cake service on request.",
      "Relaxed dining room in {area} with a semi-private corner, sharing menus and a kids' menu.",
    ],
    includes: [["Set mezze menu", "Mixed grill", "Cake cutting", "Soft drinks"], ["Sharing platters", "Reserved tables", "Birthday dessert", "Kids' menu"], ["Seafood platter", "Fattoush & hummus", "Cake service", "Fresh juices"]],
  },
  {
    type: "Private dining", count: 5, tags: ["city", "heritage"], price: [35, 75], guests: [6, 12, 20, 40], kids: 0.6,
    photos: ["restaurant", "food", "event"],
    names: ["Dar Al Layali", "The Salon Room", "Maison Achrafieh", "Beit Al Qamar", "Le Petit Salon", "Diwan Table"],
    descriptions: [
      "A private dining room in a restored {town} house, with a tasting menu and your own waiter.",
      "Intimate room for up to a few dozen guests in {area}, with a chef's menu and personalised place cards.",
    ],
    includes: [["4-course tasting menu", "Personalised menus", "Dedicated host", "Bring your own cake"], ["Chef's menu", "Welcome drink", "Private room", "Flowers & candles"]],
  },
  {
    type: "Rooftop", count: 7, tags: ["city"], price: [35, 70], guests: [10, 20, 60, 150], kids: 0.15,
    photos: ["bar", "city", "concert"],
    names: ["Sky Lounge", "Altitude", "The Terrace", "Cloud Nine", "Moonlight Roof", "Horizon Rooftop", "Rooftop 33", "Skyline Deck"],
    descriptions: [
      "Open-air rooftop above {area} with city views, a private bar section and late-night DJ sets.",
      "Rooftop lounge in {town} with sunset views, cabanas and a cocktail named after the birthday guest.",
    ],
    includes: [["Reserved section", "Canapés", "DJ set", "Birthday toast"], ["Private bar area", "Welcome cocktail", "Sharing platters", "Sparkler cake service"]],
  },
  {
    type: "Bar & lounge", count: 6, tags: ["city", "coast"], price: [28, 60], guests: [8, 15, 40, 90], kids: 0,
    photos: ["bar", "concert", "party"],
    names: ["The Velvet Room", "Arak & Ice", "Neon Lounge", "Copper Bar", "Midnight Social", "Jazz Corner", "The Speakeasy"],
    descriptions: [
      "Cosy {area} bar with VIP booths, signature cocktails and live music on weekends.",
      "Late-night lounge in {town} with a DJ, bottle service and a birthday bottle parade.",
    ],
    includes: [["VIP booth", "Welcome cocktail", "Live DJ", "Birthday bottle parade"], ["Reserved tables", "Bar snacks", "Live band", "Cake service"]],
  },
  {
    type: "Beach club", count: 7, tags: ["coast"], price: [30, 65], guests: [10, 20, 80, 250], kids: 0.4,
    photos: ["beach", "pool", "bar"],
    names: ["Blue Bay Beach", "Sunset Shore", "Pebble Beach Club", "Coral Cove", "Marine Beach", "Sands & Salt", "Lighthouse Beach"],
    descriptions: [
      "Beach club on the {town} coast with a private deck, sunbeds and a sunset BBQ for birthday groups.",
      "Seaside club in {area} with a pool, a lounge area and a DJ as the sun goes down.",
    ],
    includes: [["Private deck", "Sunbeds & towels", "BBQ buffet", "DJ at sunset"], ["Cabana", "Welcome drink", "Seafood platters", "Beach bonfire"]],
  },
  {
    type: "Pool & resort", count: 5, tags: ["coast", "mountain"], price: [30, 70], guests: [10, 25, 80, 200], kids: 0.9,
    photos: ["pool", "beach", "food"],
    names: ["Palm Resort", "Azure Pool Club", "Green Valley Resort", "Pine Pool Club", "Olive Grove Resort"],
    descriptions: [
      "Resort pool in {town} with lifeguards, a kids' pool and a shaded party area.",
      "Day resort in {area} with a large pool, lawn and buffet lunch for family birthdays.",
    ],
    includes: [["Pool access", "Buffet lunch", "Kids' pool", "Party area"], ["Day pass", "Sunbeds", "Pizza & juice", "Cake cutting"]],
  },
  {
    type: "Event space", count: 7, tags: ["city", "mountain", "coast"], price: [25, 60], guests: [20, 40, 150, 400], kids: 0.7,
    photos: ["event", "concert", "party"],
    names: ["The Warehouse", "Grand Hall", "Loft 21", "The Atelier", "Studio Seven", "Crystal Hall", "The Old Factory", "Cedar Hall"],
    descriptions: [
      "Industrial loft in {area} with a stage, sound system and flexible layouts for big birthday bashes.",
      "Elegant hall in {town} with exclusive use, catering and decoration packages.",
    ],
    includes: [["Exclusive use (5 hrs)", "Sound & lights", "Tables & linens", "Buffet dinner"], ["Exclusive use", "Stage & DJ booth", "Catering", "Decoration package"]],
  },
  {
    type: "Garden venue", count: 6, tags: ["mountain", "heritage", "bekaa"], price: [25, 55], guests: [15, 30, 120, 300], kids: 0.9,
    photos: ["event", "mountain", "food"],
    names: ["Jasmine Garden", "The Orchard", "Fig Tree Garden", "Bougainvillea", "Garden of Cedars", "Rose Terrace"],
    descriptions: [
      "Walled garden in {town} under string lights and old trees, with lawn games for the kids.",
      "Open-air garden venue in {area} with a pergola, a buffet and space to dance.",
    ],
    includes: [["Garden hire", "Buffet", "String lights", "Lawn games"], ["Pergola dining", "Mezze & grill", "Sound system", "Cake table"]],
  },
  {
    type: "Winery", count: 4, tags: ["bekaa", "mountain"], price: [35, 70], guests: [8, 15, 60, 150], kids: 0.3,
    photos: ["wine", "mountain", "food"],
    names: ["Domaine des Collines", "Château Vallée", "Vineyard House", "Cellar 1857"],
    descriptions: [
      "Winery in {town} with cellar tours, a tasting for the group and lunch overlooking the vines.",
      "Family estate near {area} offering private tastings and long-table lunches among the vineyards.",
    ],
    includes: [["Cellar tour", "Wine tasting", "Long-table lunch", "Birthday cake"], ["Private tasting", "Cheese & mezze", "Vineyard walk", "Souvenir bottle"]],
  },
  {
    type: "Mountain chalet", count: 4, tags: ["mountain"], price: [30, 60], guests: [8, 15, 40, 80], kids: 0.8,
    photos: ["mountain", "food", "party"],
    names: ["Snow Peak Chalet", "Pine Lodge", "Cedar Cabin", "Fireside Chalet"],
    descriptions: [
      "Wooden chalet in {town} with a fireplace, mountain views and a home-style dinner.",
      "Mountain lodge near {area} with a terrace, BBQ and space for the whole family.",
    ],
    includes: [["Chalet hire", "Fireplace", "Home-style dinner", "Hot chocolate bar"], ["Terrace BBQ", "Board games", "Cake service", "Bonfire"]],
  },
  {
    type: "Bowling", count: 4, tags: ["city"], price: [15, 30], guests: [6, 10, 50, 80], kids: 1,
    photos: ["gaming", "party", "casual"],
    names: ["Strike Zone", "Lucky Lanes", "Pin Up Bowling", "Cosmic Bowl"],
    descriptions: [
      "Bowling alley in {area} with reserved lanes, neon nights and a party room for cake.",
      "Family bowling centre in {town} with bumpers for kids, arcade games and pizza.",
    ],
    includes: [["2 hours of bowling", "Shoe rental", "Pizza & soft drinks", "Party room"], ["Reserved lanes", "Arcade credits", "Snacks", "Birthday song"]],
  },
  {
    type: "Karaoke", count: 4, tags: ["city"], price: [15, 30], guests: [4, 6, 20, 30], kids: 0.7,
    photos: ["music", "concert", "bar"],
    names: ["Sing Along Box", "Mic Night", "Echo Rooms", "Superstar Karaoke"],
    descriptions: [
      "Private karaoke rooms in {area} with Arabic, French and English songs and room service.",
      "Karaoke lounge in {town} with themed rooms, mood lighting and a birthday song intro.",
    ],
    includes: [["3-hour private room", "Snack platter", "Unlimited soft drinks", "Birthday song intro"], ["Themed room", "Pizza", "Mocktails", "Party props"]],
  },
  {
    type: "Kids play center", count: 7, tags: ["city"], price: [12, 28], guests: [10, 15, 40, 60], kids: 1,
    photos: ["kids", "party", "cake"],
    names: ["Happy Land", "Jump Zone", "Little Explorers", "Bounce Planet", "Tiny Town", "Play Park", "Kids Kingdom", "Rainbow Play"],
    descriptions: [
      "Indoor play centre in {area} with trampolines, soft play and a decorated party room.",
      "Kids' party venue in {town} with a party host, games, face painting and goodie bags.",
    ],
    includes: [["90 min play time", "Party host", "Pizza & juice", "Goodie bags"], ["Themed party room", "Face painting", "Games host", "Birthday cake"]],
  },
  {
    type: "Escape room", count: 4, tags: ["city"], price: [12, 25], guests: [4, 6, 20, 30], kids: 0.8,
    photos: ["party", "gaming", "event"],
    names: ["Locked In", "The Riddle House", "Mystery Rooms", "Code Breakers"],
    descriptions: [
      "Themed escape rooms in {area} that can run head-to-head, with a lounge for cake afterwards.",
      "Puzzle rooms in {town} for teams of friends, from easy kids' games to horror challenges.",
    ],
    includes: [["60-minute game", "Team photo", "Party lounge (45 min)", "Soft drinks"], ["2 rooms head-to-head", "Hints host", "Snacks", "Winner's medal"]],
  },
  {
    type: "Arcade & gaming", count: 4, tags: ["city"], price: [15, 30], guests: [6, 10, 30, 50], kids: 0.9,
    photos: ["gaming", "party", "casual"],
    names: ["Level Up Arcade", "Pixel Lounge", "VR World", "Game Zone"],
    descriptions: [
      "Gaming lounge in {area} with consoles, VR headsets and a private party corner.",
      "Arcade in {town} with racing simulators, retro machines and pizza for the group.",
    ],
    includes: [["2 hours of play", "VR session", "Pizza & soft drinks", "Party corner"], ["Arcade credits", "Tournament host", "Snacks", "Prize for the winner"]],
  },
  {
    type: "Cinema", count: 3, tags: ["city"], price: [15, 35], guests: [10, 15, 60, 100], kids: 0.9,
    photos: ["cinema", "party", "casual"],
    names: ["Private Screen", "Starlight Cinema", "The Screening Room"],
    descriptions: [
      "Private cinema hall in {area}: pick any film and bring the whole party, popcorn included.",
      "Boutique cinema in {town} with recliner seats and a lounge for cake after the film.",
    ],
    includes: [["Private screening", "Popcorn & drinks", "Lounge (1 hr)", "Birthday message on screen"], ["Recliner seats", "Snack combo", "Cake service", "Movie poster gift"]],
  },
  {
    type: "Cooking class", count: 3, tags: ["city"], price: [30, 55], guests: [6, 8, 20, 25], kids: 0.6,
    photos: ["cooking", "food", "cake"],
    names: ["Teta's Kitchen", "The Cooking Studio", "Little Chefs Academy"],
    descriptions: [
      "Hands-on Lebanese cooking class in {area}: make mezze together, then sit down to eat it.",
      "Cooking studio in {town} running pizza and cupcake parties for kids and mezze classes for adults.",
    ],
    includes: [["2-hour class", "Aprons to take home", "Meal together", "Recipe booklet"], ["Pizza or cupcake workshop", "Chef host", "Drinks", "Cake decorating"]],
  },
  {
    type: "Art studio", count: 3, tags: ["city", "heritage"], price: [20, 40], guests: [6, 8, 20, 30], kids: 0.9,
    photos: ["art", "party", "cafe"],
    names: ["Paint & Sip Studio", "The Pottery Barn", "Colour Lab"],
    descriptions: [
      "Art studio in {area} for paint-and-sip parties and kids' painting workshops.",
      "Pottery and painting studio in {town}: every guest takes home their own piece.",
    ],
    includes: [["Guided session", "All materials", "Snacks & drinks", "Take-home artwork"], ["Pottery wheel time", "Glazing & firing", "Juice & cake", "Group photo"]],
  },
  {
    type: "Spa", count: 2, tags: ["city", "mountain"], price: [45, 90], guests: [4, 6, 12, 20], kids: 0,
    photos: ["spa", "pool", "cafe"],
    names: ["Serenity Spa", "Hammam Al Nour"],
    descriptions: [
      "Day spa in {area} with a private lounge, treatments for each guest and a healthy brunch.",
      "Traditional hammam in {town} with group packages, mint tea and sweets.",
    ],
    includes: [["Massage (45 min)", "Private lounge", "Healthy brunch", "Robe & slippers"], ["Hammam ritual", "Mint tea & sweets", "Facial", "Pool access"]],
  },
  {
    type: "Yacht charter", count: 3, tags: ["coast"], price: [60, 120], guests: [6, 8, 20, 40], kids: 0.5,
    photos: ["yacht", "beach", "bar"],
    names: ["Sea Breeze Charters", "Blue Horizon Yachts", "Marina Cruises"],
    descriptions: [
      "Private yacht from {area} for a sunset cruise along the coast, with a skipper and catering.",
      "Boat party out of {town}: swim stops, music on board and a birthday cake at sea.",
    ],
    includes: [["3-hour cruise", "Skipper & crew", "Catering", "Swim stop"], ["Sunset cruise", "Drinks on board", "Music system", "Cake at sea"]],
  },
  {
    type: "Sports & padel", count: 2, tags: ["city"], price: [15, 30], guests: [8, 10, 30, 40], kids: 0.9,
    photos: ["sports", "party", "casual"],
    names: ["Goal Arena", "Padel Club"],
    descriptions: [
      "Five-a-side pitches and padel courts in {area}, with a coach and a party area after the match.",
      "Sports club in {town} for football or padel birthday tournaments with medals for everyone.",
    ],
    includes: [["Pitch hire (1.5 hrs)", "Coach / referee", "Pizza & drinks", "Medals"], ["Padel courts", "Equipment", "Snacks", "Party area"]],
  },
];

// ---- The original hand-written venues ----------------------------------------

const FEATURED = [
  ["sky-gemmayzeh", "Sky Gemmayzeh", "Rooftop", "Beirut", "Beirut", "Gemmayzeh", "Rue Gouraud, Gemmayzeh, Beirut", 33.8959, 35.514, 45, 10, 90, false, 4.7,
    "Rooftop lounge above Gemmayzeh's stairs with city and sea views, a private bar and late-night DJ sets.",
    ["Private bar area", "Mezze & canapés", "DJ set", "Birthday cake service"],
    ["1514933651103-005eec06c04b", "1470337458703-46ad1756a187", "1519501025264-65ba15a82390"]],
  ["mar-mikhael-bowl", "Mar Mikhael Bowl", "Bowling", "Beirut", "Beirut", "Mar Mikhael", "Armenia Street, Mar Mikhael, Beirut", 33.8977, 35.523, 22, 6, 60, true, 4.5,
    "Retro bowling lanes with neon lights and a party room for cake and presents.",
    ["2 hours of bowling", "Shoe rental", "Manakish & soft drinks", "Party room"],
    ["1550745165-9bc0b252726f", "1527529482837-4698179dc6ce", "1530103862676-de8c9debad1d"]],
  ["beit-hamra", "Beit Hamra", "Private dining", "Beirut", "Beirut", "Hamra", "Makdessi Street, Hamra, Beirut", 33.896, 35.4825, 38, 8, 35, true, 4.9,
    "A restored Lebanese house with a private dining room serving a family-style mezze and grill menu.",
    ["Full mezze & mashawi", "Personalised menus", "Bring your own cake", "Dedicated host"],
    ["1517248135467-4c7edcad34c4", "1414235077428-338989a2e8c0", "1555396273-367ea4eb4db5"]],
  ["zaitunay-bay-terrace", "Zaitunay Bay Terrace", "Restaurant", "Beirut", "Beirut", "Zaitunay Bay", "Zaitunay Bay, Beirut Marina", 33.901, 35.4955, 55, 10, 80, true, 4.6,
    "Marina-front terrace with yacht views, seafood sharing platters and sunset sparkler cakes.",
    ["3-course seafood menu", "Reserved terrace", "Sparkler cake service", "Mocktails for kids"],
    ["1559339352-11d035aa65de", "1504674900247-0877df9cc836", "1552566626-52f8b828add9"]],
  ["funland-dbayeh", "FunLand Dbayeh", "Kids play center", "Dbayeh", "Mount Lebanon", "Waterfront", "Dbayeh Highway, Metn", 33.937, 35.588, 18, 10, 50, true, 4.8,
    "Trampolines, soft play and a ninja course, plus a decorated party room with a dedicated host.",
    ["90 min play time", "Party host", "Pizza & juice", "Goodie bags"],
    ["1503454537195-1dcabb73ffb9", "1530103862676-de8c9debad1d", "1464366400600-7168b8af9bc3"]],
  ["jounieh-bay-lounge", "Jounieh Bay Lounge", "Bar & lounge", "Jounieh", "Mount Lebanon", "Maameltein", "Maameltein Highway, Jounieh", 33.9925, 35.6265, 40, 8, 70, false, 4.3,
    "Seafront lounge overlooking Jounieh Bay with VIP booths, live DJ and bottle service.",
    ["VIP booth", "Welcome cocktail", "Live DJ", "Birthday bottle parade"],
    ["1572116469696-31de0f17cc34", "1543007630-9710e4a00a20", "1514933651103-005eec06c04b"]],
  ["kaslik-karaoke", "Kaslik Karaoke Box", "Karaoke", "Kaslik", "Mount Lebanon", "Kaslik", "Kaslik Main Road, Jounieh", 33.98, 35.618, 20, 4, 25, true, 4.4,
    "Private soundproof karaoke rooms with Arabic, French and English songs and room service.",
    ["3-hour private room", "Snack platter", "Unlimited soft drinks", "Birthday song intro"],
    ["1516280440614-37939bbacd81", "1492684223066-81342ee5ff30", "1533174072545-7a4b6ad7a6c3"]],
  ["byblos-old-souk-garden", "Old Souk Garden", "Restaurant", "Byblos", "Mount Lebanon", "Old Souk", "Old Souk, Jbeil", 34.121, 35.648, 32, 6, 60, true, 4.8,
    "Garden restaurant under string lights in the old souk, a short walk from the ancient harbour.",
    ["Family-style dinner", "Reserved garden", "Lawn games", "Cake cutting"],
    ["1600891964092-4316c288032e", "1414235077428-338989a2e8c0", "1555396273-367ea4eb4db5"]],
  ["batroun-beach-club", "Batroun Beach Club", "Beach club", "Batroun", "North Lebanon", "Seafront", "Batroun Coastal Road", 34.255, 35.658, 35, 15, 200, false, 4.5,
    "Beach club with a private deck, live band and BBQ for big sunset birthday parties.",
    ["Private deck", "Live band set", "BBQ buffet", "Beach bonfire"],
    ["1507525428034-b723cf961d3e", "1501281668745-f7f57925c3b4", "1519046904884-53103b34b206"]],
  ["broummana-pine-loft", "Pine Loft Broummana", "Event space", "Broummana", "Mount Lebanon", "Main Street", "Broummana Main Street, Metn", 33.883, 35.621, 30, 20, 150, true, 4.5,
    "Mountain loft among the pines with a stage, fireplace and flexible layouts for big celebrations.",
    ["Exclusive use (5 hrs)", "Sound system", "Tables & linens", "Buffet dinner"],
    ["1519671482749-fd09be7ccebf", "1505236858219-8359eb29e329", "1511795409834-ef04bbd61622"]],
  ["tripoli-escape", "The Citadel Escape", "Escape room", "Tripoli", "North Lebanon", "El Mina", "El Mina, Tripoli", 34.45, 35.815, 15, 4, 24, true, 4.7,
    "Three history-themed escape rooms that can run head-to-head, with a lounge for cake afterwards.",
    ["60-minute game", "Team photo", "Party lounge (45 min)", "Soft drinks"],
    ["1528605248644-14dd04022da1", "1511795409834-ef04bbd61622", "1505236858219-8359eb29e329"]],
  ["zahle-berdawni", "Berdawni Riverside", "Restaurant", "Zahle", "Bekaa", "Berdawni", "Berdawni River, Zahle", 33.85, 35.905, 28, 10, 120, true, 4.6,
    "Classic riverside restaurant with a shaded terrace, full mezze spread and live oud.",
    ["Full mezze", "Riverside terrace", "Live oud player", "Cake service"],
    ["1517248135467-4c7edcad34c4", "1559339352-11d035aa65de", "1504674900247-0877df9cc836"]],
].map(([id, name, type, city, region, area, address, lat, lng, pricePerPerson, minGuests, maxGuests, kidFriendly, rating, description, includes, photos]) => ({
  id, name, type, city, region, area, address, lat, lng, pricePerPerson, minGuests, maxGuests, kidFriendly, rating, description, includes,
  images: photos.map(photoURL),
}));

// ---- Generation --------------------------------------------------------------

function generated() {
  const venues = [];
  const usedNames = new Set(FEATURED.map((v) => v.name));
  let photoIndex = 0;
  for (const t of TYPES) {
    const rand = rng(t.type);
    const towns = TOWNS.filter((town) => town.tags.some((tag) => t.tags.includes(tag)));
    const offset = Math.floor(rand() * towns.length);
    for (let i = 0; i < t.count; i++) {
      const town = towns[(offset + i * 7) % towns.length];
      const area = pick(rand, town.areas);
      const stem = t.names[i % t.names.length];
      const name = usedNames.has(stem) ? `${stem} ${town.city}` : stem;
      usedNames.add(name);
      const minGuests = between(rand, t.guests[0], t.guests[1]);
      const maxGuests = Math.round(between(rand, t.guests[2], t.guests[3]) / 5) * 5;
      const fill = (text) => text.replaceAll("{town}", town.city).replaceAll("{area}", area);
      venues.push({
        id: slug(name.endsWith(town.city) ? name : `${name} ${town.city}`),
        name,
        type: t.type,
        city: town.city,
        region: town.region,
        area,
        address: area === town.city ? town.city : `${area}, ${town.city}`,
        lat: Number((town.lat + (rand() - 0.5) * 0.012).toFixed(4)),
        lng: Number((town.lng + (rand() - 0.5) * 0.012).toFixed(4)),
        pricePerPerson: between(rand, t.price[0], t.price[1]),
        minGuests,
        maxGuests: Math.max(maxGuests, minGuests + 5),
        kidFriendly: rand() < t.kids,
        rating: Number((3.9 + rand() * 1.05).toFixed(1)),
        description: fill(pick(rand, t.descriptions)),
        includes: pick(rand, t.includes),
        images: pickPhotos(t.photos, photoIndex++).map(photoURL),
      });
    }
  }
  return venues;
}

function availability(id, start) {
  const rand = rng(`dates:${id}`);
  const pWeekend = 0.5 + rand() * 0.35;
  const pWeekday = 0.15 + rand() * 0.3;
  const dates = [];
  for (let d = 0; d < DAYS; d++) {
    const day = new Date(Date.UTC(start.y, start.m - 1, start.d + d));
    const weekday = day.getUTCDay();
    const weekend = weekday === 5 || weekday === 6 || weekday === 0;
    if (rand() < (weekend ? pWeekend : pWeekday)) dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}

function format(venue) {
  const { availability: dates, ...rest } = venue;
  const lines = [];
  for (let i = 0; i < dates.length; i += 6) lines.push("      " + dates.slice(i, i + 6).map((d) => `"${d}"`).join(", "));
  const json = JSON.stringify(rest, null, 2).replace(/\n}$/, "").replace(/\n/g, "\n  ");
  return `${json},\n    "availability": [\n${lines.join(",\n")}\n    ]\n  }`;
}

const startArg = process.argv[2] ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(startArg)) throw new Error(`Start date must be YYYY-MM-DD, got ${startArg}`);
const [y, m, d] = startArg.split("-").map(Number);

const venues = [...FEATURED, ...generated()].map((v) => ({ ...v, availability: availability(v.id, { y, m, d }) }));
const ids = new Set(venues.map((v) => v.id));
if (ids.size !== venues.length) throw new Error("Duplicate venue ids");

writeFileSync(
  OUT,
  `// Sample venue catalogue (Lebanon). GENERATED by scripts/generate-venues.js —
// edit that script and re-run it rather than editing this file by hand.
// Venues are fictional; towns and coordinates are real (approximate).
// Photos are Unsplash stock images. Dates start ${startArg}.
// This module is the only place the app reads venue data from (via src/api.js),
// so it can be swapped for a real backend without touching the UI.
export const venues = [
  ${venues.map(format).join(",\n  ")}
];
`,
);
console.log(`Wrote ${venues.length} venues to src/data/venues.js (dates from ${startArg}).`);
