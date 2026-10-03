import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Login from '../../libs/components/account/Login';
import Signup from '../../libs/components/account/Signup';
import ForgotPassword from '../../libs/components/account/ForgotPassword';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';

/** /account/join?mode=login (default) | signup (&type=AGENT for dealers) | forgot */
const Join: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const addressReady = useAddressReady();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : 'login';

	// the page is built before the address is known: wait for ?mode= so the wrong form never flashes
	if (!addressReady) return null;

	return (
		<div className={`auth-split ${mode === 'signup' ? 'wide' : ''}`}>
			<Head>
				<title>{t(mode === 'signup' ? 'title.signup' : mode === 'forgot' ? 'title.forgot' : 'title.account')}</title>
			</Head>
			{/* the CarZip promise next to the form (hidden on phones) */}
			<aside className="auth-visual">
				<div className="auth-photo" aria-hidden />
				<div className="auth-copy">
					<h2>{t('account.visualTitle')}</h2>
					<p>{t('account.visualText')}</p>
					<ul>
						{['home.value1Title', 'home.value2Title', 'home.value3Title'].map((key) => (
							<li key={key}>{t(key)}</li>
						))}
					</ul>
				</div>
			</aside>
			<div className="auth-main">
				{mode === 'login' && <Login />}
				{mode === 'signup' && <Signup key={String(router.query.type)} />}
				{mode === 'forgot' && <ForgotPassword />}
			</div>
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(Join, 'title.account');
