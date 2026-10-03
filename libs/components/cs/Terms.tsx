import React from 'react';

// placeholder until the terms are published by an admin (getNotices, category TERMS)
const Terms = () => {
	return (
		<div className="sidecard">
			<h3>Terms of use</h3>
			<p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', lineHeight: 1.7 }}>
				{`CarZip is a marketplace. Cars are listed and sold by independent, verified dealers.
CarZip is not a party to any sale and does not handle payments.
For cars marked for export, the dealer is fully responsible for the export.`}
			</p>
		</div>
	);
};

export default Terms;
