import React, { useRef } from 'react';

interface OtpInputProps {
	value: string;
	onChange: (code: string) => void;
	disabled?: boolean;
}

/** six boxes for the SMS code; typing or pasting moves along by itself */
const OtpInput = ({ value, onChange, disabled }: OtpInputProps) => {
	const boxes = useRef<(HTMLInputElement | null)[]>([]);
	const digits = value.padEnd(6, ' ').slice(0, 6).split('');

	const setDigit = (index: number, input: string) => {
		const typed = input.replace(/\D/g, '');
		if (!typed) return;
		const next = (value.slice(0, index) + typed).slice(0, 6);
		onChange(next);
		boxes.current[Math.min(next.length, 5)]?.focus();
	};

	const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault();
			const cut = value.length > index ? index : index - 1;
			if (cut < 0) return;
			onChange(value.slice(0, cut));
			boxes.current[cut]?.focus();
		}
	};

	return (
		<div className="otp">
			{digits.map((d, i) => (
				<input
					key={i}
					ref={(el) => {
						boxes.current[i] = el;
					}}
					inputMode="numeric"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					maxLength={6}
					value={d.trim()}
					disabled={disabled}
					onChange={(e) => setDigit(i, e.target.value)}
					onKeyDown={(e) => onKeyDown(i, e)}
				/>
			))}
		</div>
	);
};

export default OtpInput;
