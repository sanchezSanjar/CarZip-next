import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { authReadyVar, userVar } from '../../../apollo/store';
import { hasSession } from '../../auth';
import { MemberType } from '../../enums/member.enum';
import { Logo } from '../Top';
import AdminMenuList from '../admin/AdminMenuList';
import Avatar from '../common/Avatar';
import { useMyImage } from '../../hooks/useMyImage';
import LanguageSelect from '../common/LanguageSelect';
import { useTranslation } from 'next-i18next/pages';

/** admin pages: only ADMIN members may stay here */
const withLayoutAdmin = <P extends object>(Component: React.ComponentType<P>) => {
	const LayoutAdmin = (props: P) => {
		const { t } = useTranslation('common');
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const authReady = useReactiveVar(authReadyVar);
		const myImage = useMyImage();

		/** LIFECYCLES **/
		// only once the saved login was checked: before that the member is not known yet, and must not be sent away
		useEffect(() => {
			if (!authReady) return;
			if (!hasSession() && !user._id) router.push('/account/join?mode=login').then();
			else if (user._id && user.memberType !== MemberType.ADMIN) router.push('/').then();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [user, authReady]);

		return (
			<>
				<Head>
					<title>{t('title.admin')}</title>
				</Head>
				<div className="dash">
					<div className="sidenav">
						<Logo />
						<div className="who">
							<Avatar image={myImage} />
							<div>
								<b>{user.memberNick || t('nav.admin')}</b>
								<span>{t('adm.team')}</span>
							</div>
						</div>
						<div className="menu-row">
							<AdminMenuList />
						</div>
						<LanguageSelect />
					</div>
					<div className="main">
						<Component {...props} />
					</div>
				</div>
			</>
		);
	};
	return LayoutAdmin;
};

export default withLayoutAdmin;
