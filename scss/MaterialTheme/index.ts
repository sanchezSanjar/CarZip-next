import { ThemeOptions } from '@mui/material/styles';

// CarZip colours from the UI design (same values as the CSS variables in app.scss)
export const light: ThemeOptions = {
	palette: {
		mode: 'light',
		primary: { main: '#F5A623', contrastText: '#1E242B' }, // signal amber: main actions
		secondary: { main: '#0A5BB5' }, // road blue: selection, links
		success: { main: '#1F7A4D' }, // verified dealer
		error: { main: '#B3261E' },
		warning: { main: '#8A6100' },
		text: { primary: '#1E242B', secondary: '#6B737C' },
		background: { default: '#F6F7F5', paper: '#FFFFFF' },
		divider: '#DCE0DC',
	},
	typography: {
		fontFamily: "'Pretendard', sans-serif",
		button: { textTransform: 'none', fontWeight: 700 },
	},
	shape: { borderRadius: 10 },
};
