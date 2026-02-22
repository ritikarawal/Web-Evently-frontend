import React from 'react';
import { getCategoryTheme } from '@/constants/categoryThemes';

/**
 * EXAMPLE: How to Use Category Themes
 * 
 * This file demonstrates how to use the category theming system
 * in your components.
 */

// Example 1: Simple Component Using Theme
export function CategoryBadge({ category }: { category?: string }) {
  const theme = getCategoryTheme(category);

  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${theme.borderColor} ${theme.badgeBg}`}>
      <span className={`text-sm font-bold ${theme.textColor}`}>
        {theme.icon} {theme.name}
      </span>
    </div>
  );
}

// Example 2: Category Card with Full Theming
export function CategoryCard({ category }: { category?: string }) {
  const theme = getCategoryTheme(category);

  return (
    <div className={`bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} rounded-xl p-6`}>
      {/* Top Bar */}
      <div className={`h-2 w-full bg-gradient-to-r ${theme.topBarGradient} rounded-full mb-4`}></div>

      {/* Icon */}
      <div className={`${theme.iconBg} w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-3`}>
        {theme.icon}
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold ${theme.textColor} mb-2`}>
        {theme.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">
        This is a {theme.name} event with custom theme styling
      </p>

      {/* Button with theme colors */}
      <button className={`w-full px-4 py-2 bg-gradient-to-r ${theme.topBarGradient} text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200`}>
        View Events
      </button>
    </div>
  );
}

// Example 3: Dynamic Event Card Styling
export function EventCardExample({ eventCategory }: { eventCategory?: string }) {
  const theme = getCategoryTheme(eventCategory);
  const musicPath = theme.musicPath; // Use this for audio playback

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor}`}>
      <div className={`h-3 bg-gradient-to-r ${theme.topBarGradient}`}></div>

      <div className="p-6">
        <div className={`${theme.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
          <span className="text-2xl">{theme.icon}</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Amazing {theme.name} Event
        </h2>

        {/* Theme-colored badge */}
        <span className={`inline-block px-3 py-1 ${theme.badgeBg} ${theme.textColor} rounded-full text-sm font-semibold mb-4`}>
          {theme.name}
        </span>

        {/* Music player using theme colors */}
        <button className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${theme.topBarGradient} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}>
          🎵 Play {theme.name} Music
        </button>
      </div>
    </div>
  );
}

// Example 4: Using Theme in CSS-in-JS
export function ThemedAlert({ category }: { category?: string }) {
  const theme = getCategoryTheme(category);

  return (
    <div
      style={{
        backgroundColor: theme.badgeBg,
        borderColor: theme.borderColor,
        color: theme.textColor,
      }}
      className="border-2 rounded-lg p-4"
    >
      <strong> {theme.name} Alert!</strong>
      <p>This alert uses dynamic theme colors from the category system.</p>
    </div>
  );
}

// Example 5: Multiple Categories Grid
export function CategoriesGrid() {
  const categories = [
    'birthday',
    'anniversary',
    'wedding',
    'engagement',
    'workshop',
    'conference',
    'graduation',
    'fundraisers'
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {categories.map((category) => {
        const theme = getCategoryTheme(category);

        return (
          <div
            key={category}
            className={`bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} rounded-lg p-3 text-center hover:shadow-lg transition-all cursor-pointer`}
          >
            <div className="text-2xl mb-2">{theme.icon}</div>
            <p className={`text-xs font-bold ${theme.textColor}`}>{theme.name}</p>
          </div>
        );
      })}
    </div>
  );
}

// Example 6: Accessing Theme Properties Directly
export function ThemeInfo({ category }: { category?: string }) {
  const theme = getCategoryTheme(category);

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-bold mb-3">Theme Information for {theme.name}</h3>
      <ul className="text-sm space-y-2">
        <li><strong>Icon:</strong> {theme.icon}</li>
        <li><strong>Background Gradient:</strong> {theme.bgGradient}</li>
        <li><strong>Border Color:</strong> {theme.borderColor}</li>
        <li><strong>Icon Background:</strong> {theme.iconBg}</li>
        <li><strong>Icon Color:</strong> {theme.iconColor}</li>
        <li><strong>Text Color:</strong> {theme.textColor}</li>
        <li><strong>Music Path:</strong> {theme.musicPath}</li>
        <li><strong>Animation Delay:</strong> {theme.animationDelay}</li>
      </ul>
    </div>
  );
}

/**
 * THEME OBJECT STRUCTURE:
 * 
 * Each category has this structure:
 * {
 *   name: string;                    // Display name
 *   icon: string;                    // Emoji icon
 *   bgGradient: string;              // Tailwind gradient classes
 *   borderColor: string;             // Tailwind border color class
 *   topBarGradient: string;          // Gradient for top bar
 *   iconBg: string;                  // Background for icon
 *   iconColor: string;               // Icon color class
 *   buttonHover: string;             // Hover state for buttons
 *   textColor: string;               // Primary text color
 *   badgeBg: string;                 // Badge background
 *   badgeText: string;               // Badge text color
 *   musicPath: string;               // Path to audio file
 *   animationDelay: string;          // Animation delay class
 * }
 * 
 * Usage:
 * const theme = getCategoryTheme('birthday');
 * console.log(theme.name);           // "Birthday"
 * console.log(theme.icon);           // "🎂"
 * console.log(theme.bgGradient);     // "from-pink-50 to-rose-50"
 */

export default {
  CategoryBadge,
  CategoryCard,
  EventCardExample,
  ThemedAlert,
  CategoriesGrid,
  ThemeInfo,
};
