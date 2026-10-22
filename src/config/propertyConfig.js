/**
 * Central Configuration for The Conclave — Lodging and Homestay
 * Khanikar, Dibrugarh, Assam
 *
 * All property details, room configurations, contact info, and site content
 * are centralized here for easy updates and single-source truth.
 *
 * NOTE: Unknown property information is preserved as "X" as required.
 */

export const PROPERTY_INFO = {
  name: "THE CONCLAVE",
  descriptor: "LODGING AND HOMESTAY",
  tagline: "Your Stay, Thoughtfully Refined.",
  supportingText: "Discover a more considered stay in Khanikar, Dibrugarh, where comfort, simplicity and thoughtful hospitality come together.",
  totalRooms: 6,
  
  location: {
    addressLine: "Khanikar",
    locality: "Khanikar",
    city: "Dibrugarh",
    state: "Assam",
    country: "India",
    fullAddress: "Khanikar, Dibrugarh, Assam, India",
    // Coordinates and Maps URL are currently unknown and marked as "X"
    coordinates: "X",
    googleMapsUrl: "X",
    googleMapsEmbed: null
  },

  contact: {
    // Contact number and WhatsApp are currently unknown and stored as "X"
    phone: "X",
    phoneDisplay: "X",
    whatsappNumber: "X",
    email: "X",
    instagramHandle: "X",
    instagramUrl: "X"
  },

  seo: {
    title: "The Conclave | Lodging and Homestay in Dibrugarh",
    description: "Discover The Conclave, a lodging and homestay in Khanikar, Dibrugarh, Assam. Explore our rooms and enquire about your stay.",
    canonicalUrl: "https://theconclavedibrugarh.com/"
  }
};

export const propertyConfig = PROPERTY_INFO;

/**
 * Six Individually Configurable Room Records
 * Unknown information is explicitly set to "X".
 * Image assets are temporary, replaceable assets representing contemporary Indian homestay accommodations.
 */
export const roomsData = [
  {
    id: "room-01",
    name: "Room 01",
    category: "X",
    detail: "ROOM 01",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/skylinesuite4.webp",
    alt: "The Conclave — Room 01 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Couples", "Solo Travellers", "Business Travellers", "Families"],
    images: [
      "/images/skylinesuite4.webp",
      "/images/skylinesuite1.webp",
      "/images/skylinesuite2.webp",
      "/images/skylinesuite3.webp",
      "/images/skylinesuite5.webp"
    ]
  },
  {
    id: "room-02",
    name: "Room 02",
    category: "X",
    detail: "ROOM 02",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/2bhk1.webp",
    alt: "The Conclave — Room 02 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Couples", "Business Travellers", "Short Stays"],
    images: [
      "/images/2bhk1.webp",
      "/images/2bhk2.webp",
      "/images/2bhk3.webp",
      "/images/2bhk4.webp"
    ]
  },
  {
    id: "room-03",
    name: "Room 03",
    category: "X",
    detail: "ROOM 03",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/nirbili1.webp",
    alt: "The Conclave — Room 03 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Peaceful Retreat", "Couples", "Travellers"],
    images: [
      "/images/nirbili1.webp",
      "/images/nirbili2.webp",
      "/images/nirbili3.webp",
      "/images/nirbili4.webp"
    ]
  },
  {
    id: "room-04",
    name: "Room 04",
    category: "X",
    detail: "ROOM 04",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/1rk.webp",
    alt: "The Conclave — Room 04 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Solo Travellers", "Corporate Work", "Couples"],
    images: [
      "/images/1rk.webp",
      "/images/1rk2.webp",
      "/images/1rk3.webp",
      "/images/1rk4.webp"
    ]
  },
  {
    id: "room-05",
    name: "Room 05",
    category: "X",
    detail: "ROOM 05",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/skylinesuite5.webp",
    alt: "The Conclave — Room 05 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Families", "Extended Stay", "Long Visits"],
    images: [
      "/images/skylinesuite5.webp",
      "/images/skylinesuite6.webp",
      "/images/2bhk5.webp",
      "/images/2bhk6.webp"
    ]
  },
  {
    id: "room-06",
    name: "Room 06",
    category: "X",
    detail: "ROOM 06",
    capacity: "X",
    bedConfig: "X",
    roomSize: "X",
    price: "X",
    availability: "On Enquiry",
    description: "X",
    src: "/images/nirbili5.webp",
    alt: "The Conclave — Room 06 preview (replaceable asset)",
    aspectRatio: "4/5",
    amenities: [
      "Air Conditioning",
      "Attached Bathroom",
      "High-Speed WiFi",
      "Daily Housekeeping",
      "Comfort Bedding",
      "Dedicated Lighting"
    ],
    perfectFor: ["Families", "Couples", "Weekend Getaway"],
    images: [
      "/images/nirbili5.webp",
      "/images/nirbili6.webp",
      "/images/2bhk7.webp",
      "/images/1rk5.webp"
    ]
  }
];

/**
 * Property Amenities (Data-driven)
 */
export const propertyAmenitiesData = [
  {
    id: "amenity-1",
    title: "Air Conditioned Rooms",
    description: "Climate-controlled rooms providing reliable comfort during all seasons.",
    icon: "snowflake"
  },
  {
    id: "amenity-2",
    title: "High-Speed WiFi",
    description: "Consistent internet connectivity for remote work, streaming, and staying connected.",
    icon: "wifi"
  },
  {
    id: "amenity-3",
    title: "Private Attached Bathrooms",
    description: "Clean, hygienic attached bathrooms with modern fittings and hot water.",
    icon: "shower"
  },
  {
    id: "amenity-4",
    title: "Daily Housekeeping",
    description: "Regular cleaning and care to keep your room comfortable throughout your stay.",
    icon: "sparkles"
  },
  {
    id: "amenity-5",
    title: "Secure On-Site Parking",
    description: "Convenient parking area within the property grounds for guest vehicles.",
    icon: "car"
  },
  {
    id: "amenity-6",
    title: "Peaceful Residential Setting",
    description: "Quiet surroundings in Khanikar designed for unhurried rest and privacy.",
    icon: "home"
  }
];

/**
 * Brand Philosophy / Why Stay With Us
 */
export const whyStayWithUsData = [
  {
    id: 0,
    title: "THOUGHTFUL HOSPITALITY",
    desc: "A warm, personal welcome crafted around simplicity, attentive care, and quiet comfort without intrusive fuss."
  },
  {
    id: 1,
    title: "BOUTIQUE SIX-ROOM LODGING",
    desc: "With only six individually appointed rooms, enjoy an intimate, uncrowded setting designed for genuine peace of mind."
  },
  {
    id: 2,
    title: "PEACEFUL KHANIKAR LOCATION",
    desc: "A calm neighborhood in Khanikar, Dibrugarh, offering restful seclusion while remaining easily accessible to transit and town."
  }
];

/**
 * Nearby Attractions & Landmarks in Dibrugarh Region
 * No fabricated travel times or distances from Khanikar.
 */
export const nearbyAttractionsData = [
  {
    id: "attraction-01",
    name: "Brahmaputra Riverfront",
    region: "Dibrugarh",
    imageSlot: "brahmaputra",
    src: "/images/brahmaputariverfront.webp",
    alt: "Brahmaputra Riverfront in Dibrugarh, Assam",
    description: "Witness the expansive river vistas, peaceful breezes, and memorable evening sunsets along the Brahmaputra."
  },
  {
    id: "attraction-02",
    name: "Lush Tea Gardens",
    region: "Dibrugarh Region",
    imageSlot: "teagarden",
    src: "/images/teagarden.webp",
    alt: "Heritage Tea Estates in Upper Assam",
    description: "Explore Upper Assam's legendary emerald tea estates, tree-lined garden lanes, and rich heritage."
  },
  {
    id: "attraction-03",
    name: "Bogibeel Bridge",
    region: "Dibrugarh - Dhemaji",
    imageSlot: "bogibeel",
    src: "/images/bogibeel.webp",
    alt: "Bogibeel Bridge over Brahmaputra",
    description: "A monumental rail-cum-road bridge across the Brahmaputra connecting Upper Assam and Arunachal Pradesh."
  },
  {
    id: "attraction-04",
    name: "Dibrugarh Town Markets",
    region: "Dibrugarh Central",
    imageSlot: "dibrugarhtown",
    src: "/images/dibrugarhtown.webp",
    alt: "Dibrugarh Town Center and Local Markets",
    description: "Visit vibrant local markets, traditional Assamese silk weavers, culinary spots, and neighborhood shops."
  },
  {
    id: "attraction-05",
    name: "Radha Krishna Mandir",
    region: "Dibrugarh",
    imageSlot: "radhakrishnamandir",
    src: "/images/radhakrishnamandir.webp",
    alt: "Radha Krishna Mandir Dibrugarh",
    description: "A serene white marble temple complex offering quiet architecture, calm reflection, and spiritual solace."
  },
  {
    id: "attraction-06",
    name: "Dehing Patkai Rainforest",
    region: "Upper Assam Excursion",
    imageSlot: "dehingpatkai",
    src: "/images/dehingpatkai.webp",
    alt: "Dehing Patkai National Park",
    description: "Known as the Amazon of the East, a pristine stretch of lowland rainforest with diverse flora and wildlife."
  }
];

/**
 * House Rules & Guidelines
 */
export const houseRulesData = [
  {
    title: "100% Non-Smoking Indoors",
    desc: "Smoking is strictly prohibited inside all guest rooms and indoor areas to maintain fresh air for all guests."
  },
  {
    title: "Quiet Hours After 10:00 PM",
    desc: "To preserve peaceful sleep and neighborhood tranquility, quiet hours are observed each evening."
  },
  {
    title: "Government ID Required",
    desc: "A valid government-issued photo ID is mandatory for every guest during check-in as per regulations."
  },
  {
    title: "Respect Fellow Guests",
    desc: "The Conclave is a considered lodging environment. We kindly ask all guests to treat fellow visitors and staff with mutual courtesy."
  },
  {
    title: "Care For Property",
    desc: "Please treat the property and its furnishings with respect to keep the space pleasant for future guests."
  },
  {
    title: "Advance Enquiries",
    desc: "All reservations are confirmed through direct host communication to ensure personalized hospitality."
  }
];

/**
 * FAQs for The Conclave
 */
export const faqData = [
  {
    id: "faq-01",
    question: "Where is The Conclave located in Dibrugarh?",
    answer: "The Conclave is situated in Khanikar, Dibrugarh, Assam, offering a peaceful residential atmosphere with convenient road access to the rest of Dibrugarh."
  },
  {
    id: "faq-02",
    question: "How many rooms does The Conclave have?",
    answer: "The Conclave is an intimate boutique property featuring 6 individually appointed rooms, designed for privacy, quiet comfort, and attentive hosting."
  },
  {
    id: "faq-03",
    question: "How do I enquire about room availability and pricing?",
    answer: "You can submit an enquiry directly through our website booking form. All bookings require owner confirmation, ensuring each stay is thoughtfully planned."
  },
  {
    id: "faq-04",
    question: "What amenities are provided in the rooms?",
    answer: "Rooms feature air conditioning, attached private bathrooms, high-speed WiFi, clean linens, daily housekeeping, and power backup."
  },
  {
    id: "faq-05",
    question: "Who can stay at The Conclave?",
    answer: "We welcome families, couples, business travellers, and solo visitors. In accordance with regulations, valid government photo IDs are required at check-in."
  },
  {
    id: "faq-06",
    question: "Is advance booking required?",
    answer: "Because we have a select capacity of 6 rooms, we strongly recommend submitting an enquiry ahead of time to confirm dates and room availability."
  }
];
