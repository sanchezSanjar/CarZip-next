import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Login from '../../libs/components/account/Login';
import Signup from '../../libs/components/account/Signup';

/** /account/join?mode=login (default) | signup (&type=AGENT for dealers) */
const Join: NextPage = () => {
	const router = useRouter();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : 'login';

	return (
		<div className="auth" style={{ gridTemplateColumns: mode === 'signup' ? 'minmax(0, 720px)' : 'minmax(0, 520px)', justifyContent: 'center' }}>
			{mode === 'login' && <Login />}
			{mode === 'signup' && <Signup key={String(router.query.type)} />}
		</div>
	);
};

export default withLayoutBasic(Join, 'Log in | CarZip');
