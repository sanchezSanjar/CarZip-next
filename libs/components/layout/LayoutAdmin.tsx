import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import {  } from '../../utils';
import { Logo } from '../Top';
import AdminMenuList from '../admin/AdminMenuList';
import Avatar from '../common/Avatar';
import { useMyImage } from '../../hooks/useMyImage';

/** admin pages: only ADMIN members may stay here */
const withLayoutAdmin = <P extends object>(Component: React.ComponentType<P>) => {
	const LayoutAdmin = (props: P) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
	const myImage = useMyImage();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
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
							<Avatar image={myImage} />
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
