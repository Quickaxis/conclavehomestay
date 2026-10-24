/**
 * Exactly 6 Physical Rooms Configuration for The Conclave — Lodging and Homestay
 * Khanikar Chariali, Dibrugarh, Assam, India
 *
 * Total rooms: Exactly 6 (2 Vista + 1 Grand Suite + 3 Comfort)
 * Prices are per room per night:
 * - Category A: The Vista Room (2 rooms) — ₹1,999/night
 * - Category B: The Grand Suite (1 room) — ₹2,499/night
 * - Category C: The Comfort Room (3 rooms) — ₹1,499/night
 */

export const roomsData = [
  {
    id: "the-vista-room-01",
    legacyId: "room-01",
    name: "The Vista Room 01",
    category: "The Vista Room",
    detail: "ROOM 01",
    price: 1999,
    priceDisplay: "₹1,999",
    capacity: "Up to 2 Guests",
    keyFeature: "Highway-facing balcony with a better view",
    facilities: "AC, TV, attached bathroom, and balcony",
    positioning: "Ideal for travellers who want a comfortable stay with a balcony and convenient access to the highway.",
    description: "Features a highway-facing balcony with a better view, air conditioning, television, and an attached bathroom. Ideal for travellers who want a comfortable stay with a balcony and convenient access to the highway.",
    amenities: [
      "Air Conditioning",
      "Television",
      "Attached Bathroom",
      "Highway-Facing Balcony"
    ],
    perfectFor: ["Highway Travellers", "Couples", "Business Visitors"],
    src: "/images/skylinesuite4.webp",
    alt: "The Vista Room 01 at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/skylinesuite4.webp",
      "/images/skylinesuite1.webp",
      "/images/skylinesuite2.webp",
      "/images/skylinesuite3.webp",
      "/images/skylinesuite5.webp"
    ]
  },
  {
    id: "the-vista-room-02",
    legacyId: "room-02",
    name: "The Vista Room 02",
    category: "The Vista Room",
    detail: "ROOM 02",
    price: 1999,
    priceDisplay: "₹1,999",
    capacity: "Up to 2 Guests",
    keyFeature: "Highway-facing balcony with a better view",
    facilities: "AC, TV, attached bathroom, and balcony",
    positioning: "Ideal for travellers who want a comfortable stay with a balcony and convenient access to the highway.",
    description: "Features a highway-facing balcony with a better view, air conditioning, television, and an attached bathroom. Ideal for travellers who want a comfortable stay with a balcony and convenient access to the highway.",
    amenities: [
      "Air Conditioning",
      "Television",
      "Attached Bathroom",
      "Highway-Facing Balcony"
    ],
    perfectFor: ["Highway Travellers", "Couples", "Business Visitors"],
    src: "/images/skylinesuite5.webp",
    alt: "The Vista Room 02 at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/skylinesuite5.webp",
      "/images/skylinesuite6.webp",
      "/images/skylinesuite2.webp",
      "/images/skylinesuite3.webp"
    ]
  },
  {
    id: "the-grand-suite",
    legacyId: "room-03",
    name: "The Grand Suite",
    category: "The Grand Suite",
    detail: "GRAND SUITE",
    price: 2499,
    priceDisplay: "₹2,499",
    capacity: "Up to 5 Guests",
    keyFeature: "The largest and most spacious room",
    facilities: "Two AC units, TV, attached bathroom, and sofa",
    positioning: "The premium room for guests who prefer extra space and a more comfortable stay.",
    description: "The largest and most spacious room at The Conclave. Features two AC units, a television, an attached bathroom, and a sofa. The premium room for guests who prefer extra space and a more comfortable stay.",
    amenities: [
      "Two AC Units",
      "Television",
      "Attached Bathroom",
      "Sofa"
    ],
    perfectFor: ["Extra Space Seekers", "Families", "Extended Visits"],
    src: "/images/2bhk1.webp",
    alt: "The Grand Suite at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/2bhk1.webp",
      "/images/2bhk2.webp",
      "/images/2bhk3.webp",
      "/images/2bhk4.webp"
    ]
  },
  {
    id: "the-comfort-room-01",
    legacyId: "room-04",
    name: "The Comfort Room 01",
    category: "The Comfort Room",
    detail: "ROOM 03",
    price: 1499,
    priceDisplay: "₹1,499",
    capacity: "Up to 2 Guests",
    keyFeature: "Practical, comfortable, and value-oriented with balcony",
    facilities: "AC, TV, attached bathroom, and balcony",
    positioning: "Practical, comfortable, and value-oriented stay with balcony.",
    description: "A practical and comfortable room equipped with air conditioning, television, attached bathroom, and a balcony with a simpler outlook than the Vista Rooms. An honest, restful, and value-oriented choice.",
    amenities: [
      "Air Conditioning",
      "Television",
      "Attached Bathroom",
      "Balcony"
    ],
    perfectFor: ["Value Travellers", "Solo Visitors", "Short Stays"],
    src: "/images/nirbili1.webp",
    alt: "The Comfort Room 01 at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/nirbili1.webp",
      "/images/nirbili2.webp",
      "/images/nirbili3.webp",
      "/images/nirbili4.webp"
    ]
  },
  {
    id: "the-comfort-room-02",
    legacyId: "room-05",
    name: "The Comfort Room 02",
    category: "The Comfort Room",
    detail: "ROOM 04",
    price: 1499,
    priceDisplay: "₹1,499",
    capacity: "Up to 2 Guests",
    keyFeature: "Practical, comfortable, and value-oriented with balcony",
    facilities: "AC, TV, attached bathroom, and balcony",
    positioning: "Practical, comfortable, and value-oriented stay with balcony.",
    description: "A practical and comfortable room equipped with air conditioning, television, attached bathroom, and a balcony with a simpler outlook than the Vista Rooms. An honest, restful, and value-oriented choice.",
    amenities: [
      "Air Conditioning",
      "Television",
      "Attached Bathroom",
      "Balcony"
    ],
    perfectFor: ["Value Travellers", "Solo Visitors", "Short Stays"],
    src: "/images/1rk.webp",
    alt: "The Comfort Room 02 at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/1rk.webp",
      "/images/1rk2.webp",
      "/images/1rk3.webp",
      "/images/1rk4.webp"
    ]
  },
  {
    id: "the-comfort-room-03",
    legacyId: "room-06",
    name: "The Comfort Room 03",
    category: "The Comfort Room",
    detail: "ROOM 05",
    price: 1499,
    priceDisplay: "₹1,499",
    capacity: "Up to 2 Guests",
    keyFeature: "Practical, comfortable, and value-oriented with balcony",
    facilities: "AC, TV, attached bathroom, and balcony",
    positioning: "Practical, comfortable, and value-oriented stay with balcony.",
    description: "A practical and comfortable room equipped with air conditioning, television, attached bathroom, and a balcony with a simpler outlook than the Vista Rooms. An honest, restful, and value-oriented choice.",
    amenities: [
      "Air Conditioning",
      "Television",
      "Attached Bathroom",
      "Balcony"
    ],
    perfectFor: ["Value Travellers", "Solo Visitors", "Short Stays"],
    src: "/images/nirbili5.webp",
    alt: "The Comfort Room 03 at The Conclave in Khanikar Chariali, Dibrugarh",
    aspectRatio: "4/5",
    images: [
      "/images/nirbili5.webp",
      "/images/nirbili6.webp",
      "/images/2bhk7.webp",
      "/images/1rk5.webp"
    ]
  }
];
