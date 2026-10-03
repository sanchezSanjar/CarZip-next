import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Login from '../../libs/components/account/Login';
import Signup from '../../libs/components/account/Signup';
import ForgotPassword from '../../libs/components/account/ForgotPassword';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';

/** /account/join?mode=login (default) | signup (&type=AGENT for dealers) | forgot */
const Join: NextPage = () => {
	const router = useRouter();
	const addressReady = useAddressReady();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : 'login';

	// the page is built before the address is known: wait for ?mode= so the wrong form never flashes
	if (!addressReady) return null;

	return (
		<div className="auth" style={{ gridTemplateColumns: mode === 'signup' ? 'minmax(0, 720px)' : 'minmax(0, 520px)', justifyContent: 'center' }}>
			{mode === 'login' && <Login />}
			{mode === 'signup' && <Signup key={String(router.query.type)} />}
			{mode === 'forgot' && <ForgotPassword />}
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(Join, 'Log in | CarZip');
