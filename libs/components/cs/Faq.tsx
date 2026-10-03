import React, { useState } from 'react';

// sample FAQ from the UI design; the real list comes from getNotices (category FAQ)
const faqs = [
	{
		q: 'How do I buy a car on CarZip?',
		a: 'CarZip lists cars from verified dealers. When you find a car, contact the dealer directly by phone, KakaoTalk, Telegram, WhatsApp or email. Price, payment and paperwork are agreed with the dealer; CarZip does not handle money.',
	},
	{
		q: 'How does a test drive request work?',
		a: 'Log in, open the car and pick a date and time. The dealer confirms or declines, and you get a notification either way. You can cancel a request until the day of the test drive.',
	},
	{
		q: 'Can I buy a car for export?',
		a: "Yes, if the car is marked Export only or Export OK. These show a USD price set by the dealer. The dealer is fully responsible for the export: deregistration (말소등록), export paperwork, customs, shipping and payment. CarZip is only a marketplace. We don't take part in the sale, hold payments or guarantee delivery, so agree everything in writing with the dealer.",
	},
	{
		q: 'How do I become a dealer?',
		a: 'Sign up as a car dealer with your company name and business details. Our team checks your application, usually within 24 hours, and you can list cars once you are approved.',
	},
	{
		q: "Why can't I comment on a dealer's cars?",
		a: 'Dealers can block people from commenting, liking and booking test drives on their own listings. You can still see their cars and contact details.',
	},
	{
		q: 'I forgot my password.',
		a: 'Use "Forgot password?" on the log in page. We text a 6-digit code to your phone, then you choose a new password.',
	},
	{
		q: 'Is the mileage checked by CarZip?',
		a: 'No. The mileage is reported by the dealer. Check the inspection record (성능점검기록부) before you buy.',
	},
];

const Faq = () => {
	const [open, setOpen] = useState<number[]>([0, 1, 2]);
	const toggle = (i: number) => setOpen(open.includes(i) ? open.filter((o) => o !== i) : [...open, i]);

	return (
		<div className="faq">
			{faqs.map((f, i) => (
				<div key={f.q} className="faq-item">
					<div className="faq-q" role="button" style={{ cursor: 'pointer' }} onClick={() => toggle(i)}>
						{f.q}
						<span>{open.includes(i) ? '−' : '+'}</span>
					</div>
					{open.includes(i) && <div className="faq-a">{f.a}</div>}
				</div>
			))}
		</div>
	);
};

export default Faq;
