import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutAdmin from '../../libs/components/layout/LayoutAdmin';
import { withTranslations } from '../../libs/i18n';

/** /_admin opens the dealer applications, the admin's main to-do list */
const AdminHome: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/_admin/applications').then();
	}, [router]);

	return null;
};

export const getStaticProps = withTranslations;

export default withLayoutAdmin(AdminHome);
