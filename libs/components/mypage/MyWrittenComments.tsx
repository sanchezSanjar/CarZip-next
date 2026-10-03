import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import { GET_MY_COMMENTS } from '../../../apollo/user/query';
import { CommentGroup } from '../../enums/comment.enum';
import { Comment, Comments } from '../../types/comment/comment';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';
import CarPhoto from '../common/CarPhoto';
import Avatar from '../common/Avatar';
import Pager from '../common/Pager';

const LIMIT = 10;

/** where a comment lives: the car, the article or the dealer page */
const linkOf = (c: Comment) =>
	c.commentGroup === CommentGroup.CAR
		? `/car/detail?id=${c.commentRefId}`
		: c.commentGroup === CommentGroup.ARTICLE
			? `/community/detail?id=${c.commentRefId}`
			: `/agent/detail?id=${c.commentRefId}`;

/** every comment I wrote (on cars, articles and dealer pages), newest first, each linking back to where it is */
const MyWrittenComments = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getMyComments: Comments }>(GET_MY_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT } },
	});
	const rows = data?.getMyComments.list ?? [];
	const total = data?.getMyComments.metaCounter?.[0]?.total ?? 0;

	const groupLabel = { [CommentGroup.CAR]: t('my.car'), [CommentGroup.ARTICLE]: t('cm.article'), [CommentGroup.MEMBER]: t('cm.dealerPage') };

	return (
		<>
			{rows.length ? (
				<div className="block" style={{ opacity: loading ? 0.6 : 1 }}>
					{rows.map((c) => {
						const target = c.targetData;
						return (
							<div key={c._id} className="mycomment">
								{c.commentGroup === CommentGroup.MEMBER ? (
									<Avatar image={target?.image} dealer />
								) : c.commentGroup === CommentGroup.CAR || target?.image ? (
									<CarPhoto image={target?.image ?? undefined} className="thumb" />
								) : (
									<span className="cat">{t('cm.article')}</span>
								)}
								<div className="body">
									<small>
										{groupLabel[c.commentGroup]} ·{' '}
										{target ? (
											<Link href={linkOf(c)} style={{ color: 'inherit', fontWeight: 700 }}>
												{target.title}
											</Link>
										) : (
											t('cm.gone')
										)}
									</small>
									<p>{c.commentContent}</p>
									<small>{fmt.timeAgo(c.createdAt)}</small>
								</div>
								{target && (
									<Link href={linkOf(c)} className="btn ghost sm">
										{t('cm.open')}
									</Link>
								)}
							</div>
						);
					})}
				</div>
			) : (
				!loading && (
					<div className="empty">
						<h3>{t('cm.mineNone')}</h3>
						<p>{t('cm.mineNoneText')}</p>
					</div>
				)
			)}
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyWrittenComments;
