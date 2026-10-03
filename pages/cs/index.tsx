import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Faq from '../../libs/components/cs/Faq';
import Notice from '../../libs/components/cs/Notice';
import Terms from '../../libs/components/cs/Terms';

const tabs = [
	{ key: 'faq', label: 'FAQ' },
	{ key: 'notices', label: 'Notices' },
	{ key: 'terms', label: 'Terms of use' },
];

const CS: NextPage = () => {
	const router = useRouter();
	// the open tab lives in the address (/cs?tab=terms), so footer links can open it
	const tab = typeof router.query.tab === 'string' ? router.query.tab : 'faq';
	const setTab = (key: string) => router.push({ pathname: '/cs', query: { tab: key } }, undefined, { shallow: true });

	return (
		<div className="wrap">
			<h1 className="page-title">Help</h1>
			<p className="page-sub">Answers to common questions, service notices and our terms.</p>
			<div className="bar">
				<input className="field grow" placeholder='Search help, e.g. "test drive", "dealer approval"' />
			</div>
			<div className="helpgrid">
				<div className="helpnav">
					{tabs.map((t) => (
						<a key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
							{t.label}
						</a>
					))}
				</div>
				<div>
					{tab === 'faq' && (
						<>
							<Faq />
							<Notice compact />
						</>
					)}
					{tab === 'notices' && <Notice />}
					{tab === 'terms' && <Terms />}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CS, 'Help | CarZip');
