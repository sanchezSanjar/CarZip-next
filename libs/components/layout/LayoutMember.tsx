import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { authReadyVar, userVar } from '../../../apollo/store';
import { hasSession } from '../../auth';
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

// admins work in the admin panel; here they only have their profile and notifications (e.g. new dealer applications)
export const adminMenu = [
	{ category: 'notifications', label: 'menu.notifications' },
	{ category: 'myProfile', label: 'menu.profile' },
];

/** dealer and buyer pages: dark side menu on the left */
const withLayoutMember = <P extends object>(Component: React.ComponentType<P>) => {
	const LayoutMember = (props: P) => {
		const { t } = useTranslation('common');
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const authReady = useReactiveVar(authReadyVar);
		const myImage = useMyImage();
		const isAgent = user.memberType === MemberType.AGENT;
		const isAdmin = user.memberType === MemberType.ADMIN;
		const menu = isAdmin ? adminMenu : isAgent ? agentMenu : userMenu;
		const raw = (router.query.category as string) ?? (isAdmin ? 'notifications' : 'testDrives');
		const category = raw === 'addCar' || raw === 'editCar' ? 'myCars' : raw; // the car form belongs to "My cars"

		/** LIFECYCLES **/
		// my page needs a login: a guest (no saved login, nobody logged in) goes to the login page,
		// but only once the saved login was checked at page load
		useEffect(() => {
			if (!authReady) return;
			if (!hasSession() && !user._id) router.push('/account/join?mode=login').then();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [authReady, user._id]);

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
								<span>{isAdmin ? t('adm.team') : isAgent ? t('car.verified') : t('menu.buyer')}</span>
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
