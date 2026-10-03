import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Login from '../../libs/components/account/Login';

/** /account/join?mode=login (default) */
const Join: NextPage = () => {
	const router = useRouter();
	const mode = typeof router.query.mode === 'string' ? router.query.mode : 'login';

	return (
		<div className="auth" style={{ gridTemplateColumns: 'minmax(0, 520px)', justifyContent: 'center' }}>
			{mode === 'login' && <Login />}
		</div>
	);
};

export default withLayoutBasic(Join, 'Log in | CarZip');
