import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

/** server only (reads the translation files). Every page loads its texts in the visitor's language: export const getStaticProps = withTranslations */
export const withTranslations = async ({ locale }: GetStaticPropsContext) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

