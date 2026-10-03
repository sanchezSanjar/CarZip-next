import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { getJwtToken, updateUserInfo } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import { Logo } from '../Top';
import Avatar from '../common/Avatar';
import { useMyImage } from '../../hooks/useMyImage';
import Chat from '../Chat';
import LanguageSelect from '../common/LanguageSelect';
import { useTranslation } from 'next-i18next/pages';

export const agentMenu = [
	{ category: 'testDrives', label: 'menu.testDrives' },
	{ category: 'myCars', label: 'menu.myCars' },
	{ category: 'myFavorites', label: 'menu.favorites' },
	{ category: 'myArticles', label: 'menu.articles' },
	{ category: 'follows', label: 'menu.follows' },
	{ category: 'comments', label: 'menu.comments' },
	{ category: 'blocked', label: 'menu.blocked' },
	{ category: 'myProfile', label: 'menu.profile' },
	{ category: 'notifications', label: 'menu.notifications' },
];

export const userMenu = [
	{ category: 'testDrives', label: 'menu.myTestDrives' },
	{ category: 'myFavorites', label: 'menu.favorites' },
	{ category: 'recentlyVisited', label: 'menu.recent' },
	{ category: 'follows', label: 'menu.following' },
	{ category: 'comments', label: 'menu.myComments' },
	{ category: 'myProfile', label: 'menu.profile' },
	{ category: 'notifications', label: 'menu.notifications' },
];

/** dealer and buyer pages: dark side menu on the left */
const withLayoutMember = <P extends object>(Component: React.ComponentType<P>) => {
	const LayoutMember = (props: P) => {
		const { t } = useTranslation('common');
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const myImage = useMyImage();
		const isAgent = user.memberType === MemberType.AGENT;
		const menu = isAgent ? agentMenu : userMenu;
		const raw = (router.query.category as string) ?? 'testDrives';
		const category = raw === 'addCar' || raw === 'editCar' ? 'myCars' : raw; // the car form belongs to "My cars"

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
					<title>{t('title.mypage')}</title>
				</Head>
				<div className="dash">
					<div className="sidenav">
						<Logo />
						<div className="who">
							<Avatar image={myImage} dealer={isAgent} />
							<div>
								<b>{user.memberNick}</b>
								<span>{isAgent ? t('car.verified') : t('menu.buyer')}</span>
							</div>
						</div>
						<div className="menu-row">
							{menu.map((m) => (
								<Link
									key={m.category}
									href={`/mypage?category=${m.category}`}
									className={category === m.category ? 'on' : ''}
								>
									{t(m.label)}
								</Link>
							))}
							<Link href="/">{t('menu.back')}</Link>
						</div>
						<LanguageSelect />
					</div>
					<div className="main">
						<Component {...props} />
					</div>
				</div>
				<Chat />
			</>
		);
	};
	return LayoutMember;
};

export default withLayoutMember;
