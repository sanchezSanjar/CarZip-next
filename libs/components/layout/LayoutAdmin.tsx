import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import { initial } from '../../utils';
import { Logo } from '../Top';
import AdminMenuList from '../admin/AdminMenuList';

/** admin pages: only ADMIN members may stay here */
const withLayoutAdmin = (Component: React.ComponentType<any>) => {
	const LayoutAdmin = (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		useEffect(() => {
			if (!getJwtToken()) router.push('/account/join?mode=login').then();
			else if (user._id && user.memberType !== MemberType.ADMIN) router.push('/').then();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [user]);

		return (
			<>
				<Head>
					<title>Admin | CarZip</title>
				</Head>
				<div className="dash">
					<div className="sidenav">
						<Logo />
						<div className="who">
							<div className="avatar">{initial(user.memberNick || 'A')}</div>
							<div>
								<b>{user.memberNick || 'Admin'}</b>
								<span>CarZip team</span>
							</div>
						</div>
						<AdminMenuList />
					</div>
					<div className="main">
						<Component {...props} />
					</div>
				</div>
			</>
		);
	};
	return LayoutAdmin;
};

export default withLayoutAdmin;
