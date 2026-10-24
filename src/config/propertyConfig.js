import { roomsData as importedRooms } from '../data/rooms.js';

/**
 * Central Configuration for The Conclave — Lodging and Homestay
 * Khanikar Chariali, Dibrugarh, Assam, India
 *
 * All property details, room configurations, contact info, and site content
 * are centralized here for easy updates and single-source truth.
 */

export const PROPERTY_INFO = {
  name: "THE CONCLAVE",
  descriptor: "LODGING AND HOMESTAY",
  tagline: "A Comfortable Stay in Khanikar Chariali, Dibrugarh",
  supportingText: "Welcome to The Conclave — Lodging and Homestay, a comfortable place to stay in Khanikar Chariali, Dibrugarh, Assam. With six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts, The Conclave offers a convenient stay for travellers visiting Dibrugarh.",
  totalRooms: 6,
  propertyType: "Homestay",
  commonFacility: "Shared dining area",
  
  location: {
    addressLine: "Khanikar Chariali",
    locality: "Khanikar Chariali",
    city: "Dibrugarh",
    state: "Assam",
    country: "India",
    fullAddress: "Khanikar Chariali, Dibrugarh, Assam, India",
    airportEstimate: "Approximately 10 minutes from Dibrugarh Airport",
    coordinates: "X",
    googleMapsUrl: "X",
    googleMapsEmbed: null
  },

  contact: {
    phone: "X",
    phoneDisplay: "X",
    whatsappNumber: "X",
    email: "X",
    instagramHandle: "@theconclavehomestay",
    instagramUrl: "https://instagram.com/theconclavehomestay"
  },

  seo: {
    title: "The Conclave | Lodging and Homestay in Dibrugarh, Assam",
    description: "Welcome to The Conclave — Lodging and Homestay in Khanikar Chariali, Dibrugarh, Assam. Exactly six rooms, shared dining area, and highway convenience approximately 10 minutes from Dibrugarh Airport.",
    canonicalUrl: "https://theconclavedibrugarh.com/"
  }
};

export const propertyConfig = PROPERTY_INFO;

/**
 * Exactly 6 Physical Rooms Data
 */
export const roomsData = importedRooms;

/**
 * Property Amenities (Verified & Data-driven)
 */
export const propertyAmenitiesData = [
  {
    id: "amenity-1",
    title: "Air Conditioned Rooms",
    description: "Climate-controlled comfort in all six rooms (Grand Suite features two AC units).",
    icon: "snowflake"
  },
  {
    id: "amenity-2",
    title: "Television in Every Room",
    description: "In-room entertainment available across all six guest rooms.",
    icon: "tv"
  },
  {
    id: "amenity-3",
    title: "Attached Private Bathrooms",
    description: "Clean, hygienic attached bathrooms with modern fittings in every room.",
    icon: "shower"
  },
  {
    id: "amenity-4",
    title: "Shared Dining Area",
    description: "A common dining facility on the property for guests to enjoy meals in comfort.",
    icon: "utensils"
  },
  {
    id: "amenity-5",
    title: "Balconies & Views",
    description: "Highway-facing balconies on Vista Rooms; private balconies on Comfort Rooms.",
    icon: "home"
  },
  {
    id: "amenity-6",
    title: "Convenient Highway Location",
    description: "Situated in Khanikar Chariali, approximately 10 minutes from Dibrugarh Airport.",
    icon: "car"
  }
];

/**
 * Brand Highlights / Why Stay With Us
 */
export const whyStayWithUsData = [
  {
    id: 0,
    title: "A COMFORTABLE STAY",
    desc: "Welcome to The Conclave — Lodging and Homestay in Khanikar Chariali, Dibrugarh. Six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts."
  },
  {
    id: 1,
    title: "EXACTLY SIX ROOMS",
    desc: "Choose from 2 Vista Rooms with highway-facing balconies, 1 spacious Grand Suite with 2 ACs and sofa, or 3 comfortable standard rooms."
  },
  {
    id: 2,
    title: "CONVENIENT HIGHWAY ACCESS",
    desc: "Located in Khanikar Chariali, Dibrugarh, approximately 10 minutes from Dibrugarh Airport, providing a practical base for travellers."
  }
];

/**
 * Nearby Attractions & Landmarks in Dibrugarh Region
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
    desc: "To preserve peaceful sleep and tranquility, quiet hours are observed each evening."
  },
  {
    title: "Government ID Required",
    desc: "A valid government-issued photo ID is mandatory for every guest during check-in as per regulations."
  },
  {
    title: "Shared Dining Courtesy",
    desc: "Our shared dining area is a common property facility. Please treat fellow guests and shared amenities with courtesy."
  },
  {
    title: "Care For Property",
    desc: "Please treat the property and its furnishings with care to keep the space pleasant for future guests."
  },
  {
    title: "Advance Enquiries",
    desc: "With exactly 6 rooms, advance enquiry is recommended to confirm your preferred dates."
  }
];

/**
 * FAQs for The Conclave
 */
export const faqData = [
  {
    id: "faq-01",
    question: "Where is The Conclave located in Dibrugarh?",
    answer: "The Conclave — Lodging and Homestay is situated in Khanikar Chariali, Dibrugarh, Assam, India. Its highway location makes it convenient for travellers, approximately 10 minutes from Dibrugarh Airport."
  },
  {
    id: "faq-02",
    question: "How many rooms does The Conclave have?",
    answer: "The Conclave has exactly 6 physical rooms: two Vista Rooms (₹1,999/night), one Grand Suite (₹2,499/night), and three Comfort Rooms (₹1,499/night)."
  },
  {
    id: "faq-03",
    question: "What amenities are provided in every room?",
    answer: "Every room includes air conditioning, a television, and an attached bathroom. The Vista Rooms have highway-facing balconies with a better view, The Grand Suite has two AC units and a sofa, and The Comfort Rooms include private balconies."
  },
  {
    id: "faq-04",
    question: "Is there a dining facility on the property?",
    answer: "Yes, The Conclave features a shared dining area as a common facility for all staying guests."
  },
  {
    id: "faq-05",
    question: "Who can stay at The Conclave?",
    answer: "We welcome travellers, families, and business visitors. A valid government-issued photo ID is required for each guest at check-in."
  },
  {
    id: "faq-06",
    question: "How do I enquire about room rates and availability?",
    answer: "Explore our rooms and reserve directly through our website booking form. Confirmed reservations are created instantly with pay-at-property convenience."
  }
];
