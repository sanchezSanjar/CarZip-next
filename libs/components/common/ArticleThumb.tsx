import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { BoardArticleCategory } from '../../enums/board-article.enum';

interface ArticleThumbProps {
	id: string;
	image?: string | null;
	category: BoardArticleCategory;
}

/** the article's photo in a list, linking to the article; without a photo, a soft tile with the category */
const ArticleThumb = ({ id, image, category }: ArticleThumbProps) => {
	const { t } = useTranslation('common');
	return (
		<Link href={`/community/detail?id=${id}`} className="post-thumb" aria-hidden tabIndex={-1}>
			{image ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={image} alt="" loading="lazy" />
			) : (
				<span>{t(`enum.${category}`)}</span>
			)}
		</Link>
	);
};

export default ArticleThumb;
