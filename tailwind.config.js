/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'node_modules/daisyui/dist/**/*.js',
		'node_modules/react-daisyui/dist/**/*.js',
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--color-background)',
				surface: 'var(--color-surface)',
				'surface-elevated': 'var(--color-surface-elevated)',
				border: 'var(--color-border)',
				'text-primary': 'var(--color-text-primary)',
				'text-secondary': 'var(--color-text-secondary)',
				'text-muted': 'var(--color-text-muted)',
				accent: {
					DEFAULT: 'var(--color-accent)',
					hover: 'var(--color-accent-hover)',
					light: 'var(--color-accent-light)',
				},
				danger: 'var(--color-danger)',
				success: 'var(--color-success)',
				warning: 'var(--color-warning)',
			},
			borderRadius: {
				xl: '1rem',
				'2xl': '1.25rem',
				'3xl': '1.5rem',
			},
			boxShadow: {
				card: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.06)',
				'card-hover':
					'0 4px 12px 0 rgba(0,0,0,0.08), 0 1px 3px -1px rgba(0,0,0,0.05)',
				elevated: '0 8px 24px 0 rgba(0,0,0,0.08)',
			},
			animation: {
				'fade-in': 'fadeIn 0.2s ease-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideDown: {
					'0%': { opacity: '0', transform: 'translateY(-8px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
		},
	},
	plugins: [require('daisyui')],
};
