import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

export const adminMenu = [
	{ href: '/_admin/applications', label: 'adm.mApplications' },
	{ href: '/_admin/dealers', label: 'nav.dealers' },
	{ href: '/_admin/users', label: 'adm.mMembers' },
	{ href: '/_admin/cars', label: 'nt.cars' },
	{ href: '/_admin/community', label: 'adm.mCommunity' },
	{ href: '/_admin/cs', label: 'adm.mCs' },
];

const AdminMenuList = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	return (
		<>
			{adminMenu.map((m) => (
				<Link key={m.href} href={m.href} className={router.pathname.startsWith(m.href) ? 'on' : ''}>
					{t(m.label)}
				</Link>
			))}
			<Link href="/">{t('menu.back')}</Link>
		</>
	);
};

export default AdminMenuList;
