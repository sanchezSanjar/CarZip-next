import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../../apollo/user/query';
import { Menu, MenuItem } from '@mui/material';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { MemberType } from '../enums/member.enum';
import {  } from '../utils';
import { Silhouette } from './common/Avatar';
import { useMyImage } from '../hooks/useMyImage';

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
