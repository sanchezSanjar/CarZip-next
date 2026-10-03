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

export const Logo = ({ size }: { size?: number }) => (
	<Link href="/" className="logo" style={size ? { fontSize: size } : undefined}>
		<i>Z</i>CarZip
	</Link>
);

const links = [
	{ href: '/car', label: 'Buy a car', match: (p: string) => p.startsWith('/car') },
	{ href: '/agent', label: 'Dealers', match: (p: string) => p.startsWith('/agent') },
	{ href: '/community', label: 'Community', match: (p: string) => p.startsWith('/community') },
	{ href: '/cs', label: 'Help', match: (p: string) => p.startsWith('/cs') },
];

const Top = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const myImage = useMyImage();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const device = useDeviceDetect();

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
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
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
					<button className="menu-btn" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
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
									<span>{user.memberType === MemberType.AGENT ? 'Verified dealer' : user.memberType === MemberType.ADMIN ? 'Admin' : 'Buyer'}</span>
								</div>
							</div>
						) : (
							<div className="auth-btns">
								<button className="btn ghost" onClick={() => go('/account/join?mode=login')}>
									Log in
								</button>
								<button className="btn primary" onClick={() => go('/account/join?mode=signup')}>
									Sign up
								</button>
							</div>
						)}
						{links.map((l) => (
							<a key={l.href} className={l.match(router.pathname) ? 'on' : ''} onClick={() => go(l.href)}>
								{l.label}
							</a>
						))}
						{user._id && (
							<>
								<hr />
								{user.memberType === MemberType.ADMIN ? (
									<a onClick={() => go('/_admin')}>Admin</a>
								) : (
									<a onClick={() => go('/mypage')}>My page</a>
								)}
								<a onClick={() => go('/mypage?category=notifications')}>
									Notifications {unread > 0 && <span className="badge num">{unread}</span>}
								</a>
								<a
									onClick={() => {
										setDrawerOpen(false);
										logOutHandler();
									}}
								>
									Log out
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
					<Link key={l.href} href={l.href} className={l.match(router.pathname) ? 'on' : ''} style={{ color: 'inherit' }}>
						{l.label}
					</Link>
				))}
			</div>
			<div className="right">
				{user._id ? (
					<>
						{user.memberType === MemberType.ADMIN && (
							<Link href="/_admin" className="btn ghost sm">
								Admin
							</Link>
						)}
						<Link href="/mypage?category=notifications" className="notif-link">
							Notifications
							{unread > 0 && <span className="badge num">{unread > 99 ? '99+' : unread}</span>}
						</Link>
						{user.memberType !== MemberType.ADMIN && (
							<Link href="/mypage" className="btn dark sm">
								My page
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
								My page
							</MenuItem>
							<MenuItem onClick={logOutHandler}>Log out</MenuItem>
						</Menu>
					</>
				) : (
					<>
						<Link href="/account/join?mode=login" className="btn ghost">
							Log in
						</Link>
						<Link href="/account/join?mode=signup" className="btn primary">
							Sign up
						</Link>
					</>
				)}
			</div>
		</nav>
	);
};

export default Top;
