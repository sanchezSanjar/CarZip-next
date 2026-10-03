import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import { initial } from '../../utils';
import { Logo } from '../Top';

export const agentMenu = [
	{ category: 'testDrives', label: 'Test drives' },
	{ category: 'myCars', label: 'My cars' },
	{ category: 'myFavorites', label: 'My favourites' },
	{ category: 'myArticles', label: 'Articles' },
	{ category: 'follows', label: 'Followers & following' },
	{ category: 'comments', label: 'Comments' },
	{ category: 'blocked', label: 'Blocked people' },
	{ category: 'myProfile', label: 'My profile' },
	{ category: 'notifications', label: 'Notifications' },
];

export const userMenu = [
	{ category: 'testDrives', label: 'My test drives' },
	{ category: 'myFavorites', label: 'My favourites' },
	{ category: 'recentlyVisited', label: 'Recently viewed' },
	{ category: 'follows', label: 'Following' },
	{ category: 'myProfile', label: 'My profile' },
	{ category: 'notifications', label: 'Notifications' },
];

/** dealer and buyer pages: dark side menu on the left */
const withLayoutMember = (Component: React.ComponentType<any>) => {
	const LayoutMember = (props: any) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const isAgent = user.memberType === MemberType.AGENT;
		const menu = isAgent ? agentMenu : userMenu;
		const category = (router.query.category as string) ?? 'testDrives';

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			else router.push('/account/join?mode=login').then(); // my page needs a login
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		return (
			<>
				<Head>
					<title>My page | CarZip</title>
				</Head>
				<div className="dash">
					<div className="sidenav">
						<Logo />
						<div className="who">
							<div className="avatar">{initial(user.memberNick)}</div>
							<div>
								<b>{user.memberNick}</b>
								<span>{isAgent ? 'Verified dealer' : 'Buyer'}</span>
							</div>
						</div>
						{menu.map((m) => (
							<Link key={m.category} href={`/mypage?category=${m.category}`} className={category === m.category ? 'on' : ''}>
								{m.label}
							</Link>
						))}
						<Link href="/">Back to CarZip</Link>
					</div>
					<div className="main">
						<Component {...props} />
					</div>
				</div>
			</>
		);
	};
	return LayoutMember;
};

export default withLayoutMember;
