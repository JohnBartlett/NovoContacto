/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple System Colors
        systemBlue: '#007AFF',
        systemGreen: '#34C759',
        systemOrange: '#FF9500',
        systemRed: '#FF3B30',
        systemPurple: '#AF52DE',
        systemPink: '#FF2D92',
        systemTeal: '#5AC8FA',
        systemIndigo: '#5856D6',
        systemYellow: '#FFCC00',
        
        // Apple Gray Scale
        systemGray: {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        
        // Apple Background Colors
        systemBackground: '#FFFFFF',
        secondarySystemBackground: '#F2F2F7',
        tertiarySystemBackground: '#FFFFFF',
        
        // Apple Label Colors
        label: '#000000',
        secondaryLabel: '#3C3C43',
        tertiaryLabel: '#3C3C43',
        quaternaryLabel: '#2C2C2E',
      },
      fontFamily: {
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '400' }],
        'title-1': ['28px', { lineHeight: '34px', fontWeight: '400' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '400' }],
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'apple': '10px',
        'apple-lg': '12px',
        'apple-xl': '16px',
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
