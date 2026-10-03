import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../../apollo/user/query';
import { Drawer, Menu, MenuItem } from '@mui/material';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { MemberType } from '../enums/member.enum';
import { Silhouette } from './common/Avatar';
import { useMyImage } from '../hooks/useMyImage';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next/pages';
import { languages } from '../languages';

export const Logo = ({ size }: { size?: number }) => (
	<Link href="/" className="logo" style={size ? { fontSize: size } : undefined}>
		<i>Z</i>CarZip
	</Link>
);

const links = [
	{ href: '/car', label: 'nav.buyCar', match: (p: string) => p.startsWith('/car') },
	{ href: '/agent', label: 'nav.dealers', match: (p: string) => p.startsWith('/agent') },
	{ href: '/community', label: 'nav.community', match: (p: string) => p.startsWith('/community') },
	{ href: '/cs', label: 'nav.help', match: (p: string) => p.startsWith('/cs') },
];

const Top = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const myImage = useMyImage();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [langEl, setLangEl] = useState<null | HTMLElement>(null);
	const locale = router.locale ?? 'en';
	const currentLang = languages.find((l) => l.code === locale) ?? languages[0];

	/** APOLLO REQUESTS **/
	// notifications don't arrive live yet: ask for the unread count every minute
	const { data: unreadData } = useQuery<{ getUnreadNotificationCount: number }>(GET_UNREAD_NOTIFICATION_COUNT, {
		skip: !user._id,
		pollInterval: 60000,
		fetchPolicy: 'cache-and-network',
	});
	const unread = unreadData?.getUnreadNotificationCount ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		const saved = localStorage.getItem('locale');
		if (saved && saved !== router.locale && languages.some((l) => l.code === saved)) {
			router.replace(router.asPath, router.asPath, { locale: saved }).then();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const chooseLanguage = (code: string) => {
		setLangEl(null);
		setDrawerOpen(false);
		localStorage.setItem('locale', code);
		router.push(router.asPath, router.asPath, { locale: code }).then();
	};
	const langMenu = (
		<Menu anchorEl={langEl} open={!!langEl} onClose={() => setLangEl(null)}>
			{languages.map((l) => (
				<MenuItem key={l.code} selected={l.code === locale} onClick={() => chooseLanguage(l.code)}>
					<b style={{ width: 30 }}>{l.short}</b> {t(l.label)}
				</MenuItem>
			))}
		</Menu>
	);
	const logOutHandler = () => {
		setAnchorEl(null);
		logOut();
		router.push('/').then();
	};

	const avatar = (
		<span className={`avatar ${user.memberType === MemberType.AGENT ? '' : 'user'}`}>
			{myImage ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={myImage} alt="" />
			) : (
				<Silhouette />
			)}
		</span>
	);

	/** phones: logo and a menu button; everything else lives in a drawer */
	if (device === 'mobile') {
		const go = (href: string) => {
			setDrawerOpen(false);
			router.push(href).then();
		};
		return (
			<nav className="nav mobile-nav">
				<Logo />
				<div className="right">
					{user._id && unread > 0 && (
						<Link href="/mypage?category=notifications" className="notif-link">
							<span className="badge num">{unread > 99 ? '99+' : unread}</span>
						</Link>
					)}
					<button className="menu-btn" aria-label={t('nav.openMenu')} onClick={() => setDrawerOpen(true)}>
						<span />
						<span />
						<span />
					</button>
				</div>
				<Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
					<div className="mobile-drawer">
						{user._id ? (
							<div className="who">
								{avatar}
								<div>
									<b>{user.memberNick}</b>
									<span>{t(user.memberType === MemberType.AGENT ? 'nav.roleDealer' : user.memberType === MemberType.ADMIN ? 'nav.roleAdmin' : 'nav.roleBuyer')}</span>
								</div>
							</div>
						) : (
							<div className="auth-btns">
								<button className="btn ghost" onClick={() => go('/account/join?mode=login')}>
									{t('nav.logIn')}
								</button>
								<button className="btn primary" onClick={() => go('/account/join?mode=signup')}>
									{t('nav.signUp')}
								</button>
							</div>
						)}
						<div className="drawer-langs">
							{languages.map((l) => (
								<button key={l.code} className={l.code === locale ? 'on' : ''} onClick={() => chooseLanguage(l.code)}>
									{l.short}
								</button>
							))}
						</div>
						{links.map((l) => (
							<a key={l.href} className={l.match(router.pathname) ? 'on' : ''} onClick={() => go(l.href)}>
								{t(l.label)}
							</a>
						))}
						{user._id && (
							<>
								<hr />
								{user.memberType === MemberType.ADMIN ? (
									<a onClick={() => go('/_admin')}>{t('nav.admin')}</a>
								) : (
									<a onClick={() => go('/mypage')}>{t('nav.myPage')}</a>
								)}
								<a onClick={() => go('/mypage?category=notifications')}>
									{t('nav.notifications')} {unread > 0 && <span className="badge num">{unread}</span>}
								</a>
								<a
									onClick={() => {
										setDrawerOpen(false);
										logOutHandler();
									}}
								>
									{t('nav.logOut')}
								</a>
							</>
						)}
					</div>
				</Drawer>
			</nav>
		);
	}

	return (
		<nav className="nav">
			<Logo />
			<div className="links">
				{links.map((l) => (
					<Link key={l.href} href={l.href} className={l.match(router.pathname) ? 'on' : ''}>
						{t(l.label)}
					</Link>
				))}
			</div>
			<div className="right">
				<button className="lang-btn" aria-label={t('nav.language')} onClick={(e) => setLangEl(e.currentTarget)}>
					{currentLang.short} ▾
				</button>
				{langMenu}
				{user._id ? (
					<>
						{user.memberType === MemberType.ADMIN && (
							<Link href="/_admin" className="btn ghost sm">
								{t('nav.admin')}
							</Link>
						)}
						<Link href="/mypage?category=notifications" className="notif-link">
							{t('nav.notifications')}
							{unread > 0 && <span className="badge num">{unread > 99 ? '99+' : unread}</span>}
						</Link>
						{user.memberType !== MemberType.ADMIN && (
							<Link href="/mypage" className="btn dark sm">
								{t('nav.myPage')}
							</Link>
						)}
						<div
							className={`avatar ${user.memberType === MemberType.AGENT ? '' : 'user'}`}
							role="button"
							style={{ cursor: 'pointer' }}
							onClick={(e) => setAnchorEl(e.currentTarget)}
						>
							{myImage ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={myImage} alt="" />
							) : (
								<Silhouette />
							)}
						</div>
						<Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
							<MenuItem disabled>{user.memberNick}</MenuItem>
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									router.push('/mypage').then();
								}}
							>
								{t('nav.myPage')}
							</MenuItem>
							<MenuItem onClick={logOutHandler}>{t('nav.logOut')}</MenuItem>
						</Menu>
					</>
				) : (
					<>
						<Link href="/account/join?mode=login" className="btn ghost">
							{t('nav.logIn')}
						</Link>
						<Link href="/account/join?mode=signup" className="btn primary">
							{t('nav.signUp')}
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Top;
