import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { Menu, MenuItem } from '@mui/material';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { MemberType } from '../enums/member.enum';
import { initial } from '../utils';

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
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
						<Link href="/mypage?category=notifications" style={{ fontSize: 14, color: 'var(--muted)' }}>
							Notifications
						</Link>
						<div
							className={`avatar ${user.memberType === MemberType.AGENT ? '' : 'user'}`}
							role="button"
							style={{ cursor: 'pointer' }}
							onClick={(e) => setAnchorEl(e.currentTarget)}
						>
							{initial(user.memberNick)}
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
