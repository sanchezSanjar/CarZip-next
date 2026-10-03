import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import Pager from '../../../libs/components/common/Pager';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, REMOVE_COMMENT_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { BoardArticle, BoardArticles } from '../../../libs/types/board-article/board-article';
import { Comments } from '../../../libs/types/comment/comment';
import { getErrorMessage } from '../../../libs/auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { dealerName, enumLabel, formatNumber, initial, timeAgo } from '../../../libs/utils';

const LIMIT = 10;

/** comments under one article, each with a delete button (only admins delete comments) */
const ArticleComments = ({ article }: { article: BoardArticle }) => {
	const { data, loading } = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', search: { commentRefId: article._id } } },
	});
	const [removeComment] = useMutation(REMOVE_COMMENT_BY_ADMIN, { refetchQueries: [GET_COMMENTS, GET_ALL_BOARD_ARTICLES_BY_ADMIN] });
	const comments = data?.getComments.list ?? [];

	const remove = async (id: string, text: string) => {
		if (!(await sweetConfirmAlert(`Delete this comment? "${text.slice(0, 120)}"`, 'Delete comment', true))) return;
		try {
			await removeComment({ variables: { input: id } });
			await sweetTopSuccessAlert('Comment deleted', 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<div className="block" style={{ margin: 0, padding: '6px 20px 16px' }}>
			<div className="block-head" style={{ padding: '12px 0' }}>
				<h2>
					Comments<span>{comments.length}</span>
				</h2>
				<Link href={`/community/detail?id=${article._id}`} className="btn ghost sm">
					Open article
				</Link>
			</div>
			{comments.map((c) => (
				<div key={c._id} className="comment">
					<div className="avatar user">{initial(dealerName(c.memberData))}</div>
					<div style={{ flex: 1 }}>
						<div className="who">
							{dealerName(c.memberData)} <small>{timeAgo(c.createdAt)}</small>
						</div>
						<p>{c.commentContent}</p>
					</div>
					<button className="btn danger sm" style={{ alignSelf: 'center' }} onClick={() => remove(c._id, c.commentContent)}>
						Delete
					</button>
				</div>
			))}
			{!loading && !comments.length && <p className="muted">No comments on this article.</p>}
		</div>
	);
};

/** admin: every article in any status. Delete hides it, restore brings it back, remove is for good */
const AdminCommunity: NextPage = () => {
	const [status, setStatus] = useState<BoardArticleStatus | undefined>();
	const [category, setCategory] = useState<BoardArticleCategory | ''>('');
	const [page, setPage] = useState(1);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	/** APOLLO REQUESTS **/
	const search = { ...(status ? { articleStatus: status } : {}), ...(category ? { articleCategory: category } : {}) };
	const { data, loading } = useQuery<{ getAllBoardArticlesByAdmin: BoardArticles }>(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT, sort: 'createdAt', ...(Object.keys(search).length ? { search } : {}) } },
	});
	const refetchQueries = [GET_ALL_BOARD_ARTICLES_BY_ADMIN];
	const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN, { refetchQueries });
	const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN, { refetchQueries });
	const articles = data?.getAllBoardArticlesByAdmin.list ?? [];
	const total = data?.getAllBoardArticlesByAdmin.metaCounter?.[0]?.total ?? 0;
	const selected = articles.find((a) => a._id === selectedId);

	/** HANDLERS **/
	const run = async (question: string, confirmText: string, task: () => Promise<unknown>, done: string) => {
		if (!(await sweetConfirmAlert(question, confirmText, true))) return;
		try {
			await task();
			await sweetTopSuccessAlert(done, 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const setArticleStatus = (a: BoardArticle, articleStatus: BoardArticleStatus) =>
		run(
			articleStatus === BoardArticleStatus.DELETE ? `Hide "${a.articleTitle}" from Community?` : `Show "${a.articleTitle}" in Community again?`,
			articleStatus === BoardArticleStatus.DELETE ? 'Delete' : 'Restore',
			() => updateArticle({ variables: { input: { _id: a._id, articleStatus } } }),
			articleStatus === BoardArticleStatus.DELETE ? 'Article deleted' : 'Article restored',
		);
	const removeForGood = (a: BoardArticle) =>
		run(
			`Remove "${a.articleTitle}" for good? Its likes, comments, views and notifications go too. This can't be undone.`,
			'Remove for good',
			() => removeArticle({ variables: { input: a._id } }),
			'Removed',
		);

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Comments & articles</h1>
					<p>Only admins can delete comments. Pick an article to see its comments.</p>
				</div>
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					{[undefined, BoardArticleStatus.ACTIVE, BoardArticleStatus.DELETE].map((s) => (
						<span
							key={s ?? 'all'}
							className={`chip ${status === s ? 'on' : ''}`}
							onClick={() => {
								setStatus(s);
								setPage(1);
							}}
						>
							{s === BoardArticleStatus.ACTIVE ? 'Active' : s === BoardArticleStatus.DELETE ? 'Deleted' : 'All'}
						</span>
					))}
				</div>
				<div className="grow" />
				<select
					className="field"
					style={{ width: 180 }}
					value={category}
					onChange={(e) => {
						setCategory(e.target.value as BoardArticleCategory | '');
						setPage(1);
					}}
				>
					<option value="">All categories</option>
					{Object.values(BoardArticleCategory).map((c) => (
						<option key={c} value={c}>
							{enumLabel(c)}
						</option>
					))}
				</select>
			</div>
			<div className="comments-wrap" style={{ gridTemplateColumns: selected ? '1fr 440px' : '1fr' }}>
				<div>
					<div className="block" style={{ margin: 0, opacity: loading && articles.length ? 0.6 : 1 }}>
						<table>
							<thead>
								<tr>
									<th>Article</th>
									<th>Author</th>
									<th>Category</th>
									<th>Views</th>
									<th>Comments</th>
									<th>Status</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{articles.map((a) => {
									const deleted = a.articleStatus === BoardArticleStatus.DELETE;
									return (
										<tr
											key={a._id}
											onClick={() => setSelectedId(a._id)}
											style={{ cursor: 'pointer', ...(a._id === selectedId ? { background: '#F4F8FD', boxShadow: 'inset 3px 0 0 var(--road)' } : {}) }}
										>
											<td style={{ fontWeight: 600 }}>{a.articleTitle}</td>
											<td>{dealerName(a.memberData)}</td>
											<td>
												<span className="cat">{enumLabel(a.articleCategory)}</span>
											</td>
											<td className="num">{formatNumber(a.articleViews)}</td>
											<td className="num">{a.articleComments}</td>
											<td>
												<span className={`pill ${deleted ? 'sold' : 'active'}`}>{deleted ? 'Deleted' : 'Active'}</span>
											</td>
											<td onClick={(e) => e.stopPropagation()}>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													{deleted ? (
														<>
															<button className="btn dark sm" onClick={() => setArticleStatus(a, BoardArticleStatus.ACTIVE)}>
																Restore
															</button>
															<button className="btn danger sm" onClick={() => removeForGood(a)}>
																Remove for good
															</button>
														</>
													) : (
														<button className="btn danger sm" onClick={() => setArticleStatus(a, BoardArticleStatus.DELETE)}>
															Delete
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{!loading && !articles.length && (
							<div className="empty" style={{ margin: 18 }}>
								<h3>No articles here</h3>
							</div>
						)}
					</div>
					<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
				</div>
				{selected && <ArticleComments key={selected._id} article={selected} />}
			</div>
		</>
	);
};

export default withLayoutAdmin(AdminCommunity);
