import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const adminMenu = [
	{ href: '/_admin/applications', label: 'Dealer applications' },
	{ href: '/_admin/dealers', label: 'Dealers' },
	{ href: '/_admin/users', label: 'Members' },
	{ href: '/_admin/cars', label: 'Cars' },
	{ href: '/_admin/community', label: 'Comments & articles' },
	{ href: '/_admin/cs', label: 'Notices & FAQ' },
];

const AdminMenuList = () => {
	const router = useRouter();
	return (
		<>
			{adminMenu.map((m) => (
				<Link key={m.href} href={m.href} className={router.pathname.startsWith(m.href) ? 'on' : ''}>
					{m.label}
				</Link>
			))}
			<Link href="/">Back to CarZip</Link>
		</>
	);
};

export default AdminMenuList;
