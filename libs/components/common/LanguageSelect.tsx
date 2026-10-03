import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { languages } from '../../languages';

/** language buttons for the side menus (My page, admin), which have no top bar; remembers the choice like the top bar does */
const LanguageSelect = () => {
	const { t } = useTranslation('common');
	const router = useRouter();

	const choose = (code: string) => {
		try {
			localStorage.setItem('locale', code);
		} catch {
			// private mode: the choice just isn't remembered
		}
		router.push(router.asPath, router.asPath, { locale: code }).then();
	};

	return (
		<div className="side-langs" role="group" aria-label={t('dlg.language')}>
			{languages.map((l) => (
				<button key={l.code} className={l.code === router.locale ? 'on' : ''} title={l.label} onClick={() => choose(l.code)}>
					{l.short}
				</button>
			))}
		</div>
	);
};

export default LanguageSelect;
