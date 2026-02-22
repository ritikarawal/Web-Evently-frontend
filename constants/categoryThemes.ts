// Category color themes, gradients, and music paths
export const CATEGORY_THEMES = {
  birthday: {
    name: "Birthday",
    icon: "🎂",
    bgGradient: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200",
    topBarGradient: "from-pink-400 via-rose-400 to-red-400",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    buttonHover: "hover:from-pink-600 hover:to-rose-600",
    textColor: "text-pink-600",
    badgeBg: "bg-pink-50",
    badgeText: "text-pink-700",
    musicPath: "/music/birthday.mp3",
    animationDelay: "delay-0"
  },
  anniversary: {
    name: "Anniversary",
    icon: "💕",
    bgGradient: "from-red-50 to-pink-50",
    borderColor: "border-red-200",
    topBarGradient: "from-red-400 via-pink-400 to-rose-400",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    buttonHover: "hover:from-red-600 hover:to-pink-600",
    textColor: "text-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    musicPath: "/music/anniversary.mp3",
    animationDelay: "delay-100"
  },
  wedding: {
    name: "Wedding",
    icon: "💍",
    bgGradient: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    topBarGradient: "from-purple-400 via-indigo-400 to-blue-400",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    buttonHover: "hover:from-purple-600 hover:to-indigo-600",
    textColor: "text-purple-600",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    musicPath: "/music/wedding.mp3",
    animationDelay: "delay-200"
  },
  engagement: {
    name: "Engagement",
    icon: "💎",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    topBarGradient: "from-blue-400 via-cyan-400 to-teal-400",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    buttonHover: "hover:from-blue-600 hover:to-cyan-600",
    textColor: "text-blue-600",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    musicPath: "/music/engagement.mp3",
    animationDelay: "delay-300"
  },
  workshop: {
    name: "Workshop",
    icon: "🛠️",
    bgGradient: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    topBarGradient: "from-green-400 via-emerald-400 to-teal-400",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    buttonHover: "hover:from-green-600 hover:to-emerald-600",
    textColor: "text-green-600",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
    musicPath: "/music/workshop.mp3",
    animationDelay: "delay-0"
  },
  conference: {
    name: "Conference",
    icon: "🎤",
    bgGradient: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
    topBarGradient: "from-indigo-400 via-purple-400 to-pink-400",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    buttonHover: "hover:from-indigo-600 hover:to-purple-600",
    textColor: "text-indigo-600",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    musicPath: "/music/conference.mp3",
    animationDelay: "delay-100"
  },
  graduation: {
    name: "Graduation",
    icon: "🎓",
    bgGradient: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    topBarGradient: "from-yellow-400 via-orange-400 to-red-400",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    buttonHover: "hover:from-yellow-600 hover:to-orange-600",
    textColor: "text-yellow-600",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-700",
    musicPath: "/music/graduation.mp3",
    animationDelay: "delay-200"
  },
  fundraisers: {
    name: "Fundraisers",
    icon: "🤝",
    bgGradient: "from-orange-50 to-amber-50",
    borderColor: "border-orange-200",
    topBarGradient: "from-orange-400 via-amber-400 to-yellow-400",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    buttonHover: "hover:from-orange-600 hover:to-amber-600",
    textColor: "text-orange-600",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    musicPath: "/music/fundraisers.mp3",
    animationDelay: "delay-300"
  }
};

export const getCategoryTheme = (category?: string) => {
  if (!category) return CATEGORY_THEMES.birthday;
  const key = category.toLowerCase() as keyof typeof CATEGORY_THEMES;
  return CATEGORY_THEMES[key] || CATEGORY_THEMES.birthday;
};

export const getAudioForCategory = (category?: string) => {
  const theme = getCategoryTheme(category);
  return theme.musicPath;
};
