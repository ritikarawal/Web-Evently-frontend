// Mock events data for each category
export const MOCK_EVENTS = [
  {
    _id: "1",
    title: "Sarah's 30th Birthday Bash",
    description: "Join us for an unforgettable birthday celebration with friends, family, and amazing food. Dancing, games, and birthday surprises awaiting!",
    startDate: "2025-03-15",
    endDate: "2025-03-15",
    location: "Grand Ballroom, Downtown",
    category: "birthday",
    capacity: 100,
    attendees: [{ _id: "user1" }, { _id: "user2" }, { _id: "user3" }],
    organizer: {
      _id: "org1",
      firstName: "Sarah",
      lastName: "Johnson"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 25
  },
  {
    _id: "2",
    title: "Golden Anniversary Celebration",
    description: "Celebrating 50 wonderful years of marriage! Join us for a romantic dinner, music, and dancing. A celebration of love, commitment, and beautiful memories.",
    startDate: "2025-04-12",
    endDate: "2025-04-12",
    location: "Riverside Restaurant & Bar",
    category: "anniversary",
    capacity: 150,
    attendees: [{ _id: "user4" }, { _id: "user5" }],
    organizer: {
      _id: "org2",
      firstName: "Robert",
      lastName: "Williams"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 50
  },
  {
    _id: "3",
    title: "Emma & James Wedding Reception",
    description: "You're invited to celebrate the union of two souls! Join us for an elegant evening of vows, celebration, and joy. Dinner, dancing, and memories to last a lifetime.",
    startDate: "2025-05-22",
    endDate: "2025-05-22",
    location: "Elegant Manor Estate",
    category: "wedding",
    capacity: 250,
    attendees: [{ _id: "user6" }, { _id: "user7" }, { _id: "user8" }, { _id: "user9" }],
    organizer: {
      _id: "org3",
      firstName: "Emma",
      lastName: "Davis"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 100
  },
  {
    _id: "4",
    title: "Michael's Engagement Party",
    description: "Let's celebrate the beginning of a new chapter! Join us for cocktails, appetizers, and toasts as we celebrate Michael and his beautiful bride-to-be.",
    startDate: "2025-02-28",
    endDate: "2025-02-28",
    location: "Rooftop Lounge, City Center",
    category: "engagement",
    capacity: 80,
    attendees: [{ _id: "user10" }, { _id: "user11" }],
    organizer: {
      _id: "org4",
      firstName: "Michael",
      lastName: "Brown"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 35
  },
  {
    _id: "5",
    title: "Advanced Web Development Workshop",
    description: "Learn cutting-edge web technologies! This intensive workshop covers React, Next.js, TypeScript, and modern development practices. Perfect for intermediate developers.",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    location: "Tech Innovation Hub",
    category: "workshop",
    capacity: 50,
    attendees: [{ _id: "user12" }, { _id: "user13" }, { _id: "user14" }, { _id: "user15" }, { _id: "user16" }],
    organizer: {
      _id: "org5",
      firstName: "Alex",
      lastName: "Chen"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 199
  },
  {
    _id: "6",
    title: "Global Tech Conference 2025",
    description: "The biggest tech event of the year! Network with industry leaders, attend keynotes from tech giants, and explore the future of innovation across 3 days.",
    startDate: "2025-06-10",
    endDate: "2025-06-12",
    location: "Convention Center, Main Hall",
    category: "conference",
    capacity: 1000,
    attendees: [{ _id: "user17" }, { _id: "user18" }, { _id: "user19" }, { _id: "user20" }, { _id: "user21" }, { _id: "user22" }],
    organizer: {
      _id: "org6",
      firstName: "Victoria",
      lastName: "Martinez"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 299
  },
  {
    _id: "7",
    title: "Class of 2025 Graduation Ceremony",
    description: "Celebrate academic achievement and new beginnings! Join us for the official graduation ceremony, followed by a celebration reception with family and Friends.",
    startDate: "2025-05-30",
    endDate: "2025-05-30",
    location: "University Stadium",
    category: "graduation",
    capacity: 2000,
    attendees: [{ _id: "user23" }, { _id: "user24" }, { _id: "user25" }],
    organizer: {
      _id: "org7",
      firstName: "Dean",
      lastName: "Peterson"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 0
  },
  {
    _id: "8",
    title: "Community Relief Fundraiser Gala",
    description: "Make a difference in our community! Join us for an elegant evening supporting local charities. 100% of proceeds go to helping those in need.",
    startDate: "2025-04-20",
    endDate: "2025-04-20",
    location: "Crystal Ballroom Downtown",
    category: "fundraisers",
    capacity: 300,
    attendees: [{ _id: "user26" }, { _id: "user27" }, { _id: "user28" }, { _id: "user29" }, { _id: "user30" }],
    organizer: {
      _id: "org8",
      firstName: "Jennifer",
      lastName: "Anderson"
    },
    status: "approved",
    isPublic: true,
    ticketPrice: 75
  }
];
