import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Pager from '../../libs/components/common/Pager';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { Direction } from '../../libs/enums/common.enum';
import { BoardArticles } from '../../libs/types/board-article/board-article';
import { dealerName } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import ArticleThumb from '../../libs/components/common/ArticleThumb';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../libs/hooks/useLocaleFormat';

const LIMIT = 8;
const sorts = [
	{ value: 'createdAt', label: 'board.sortNewest' },
	{ value: 'articleViews', label: 'board.sortViews' },
	{ value: 'articleLikes', label: 'board.sortLikes' },
	{ value: 'articleComments', label: 'board.sortComments' },
];

const Community: NextPage = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const user = useReactiveVar(userVar);
	const [category, setCategory] = useState<BoardArticleCategory | ''>('');
	const [text, setText] = useState('');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('createdAt');
	const [page, setPage] = useState(1);
	const canWrite = user.memberType === MemberType.AGENT || user.memberType === MemberType.ADMIN;

	/** APOLLO REQUESTS **/
	const filters = { ...(category ? { articleCategory: category } : {}), ...(search ? { text: search } : {}) };
	const { data, loading } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT, sort, direction: Direction.DESC, ...(Object.keys(filters).length ? { search: filters } : {}) } },
	});
	const { data: topData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 5, sort: 'articleViews', direction: Direction.DESC } },
	});
	const articles = data?.getBoardArticles.list ?? [];
	const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
	const mostRead = topData?.getBoardArticles.list ?? [];

	/** HANDLERS **/
	const pick = (c: BoardArticleCategory | '') => {
		setCategory(c);
		setPage(1);
	};
	const searchHandler = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(text.trim());
		setPage(1);
	};

	return (
		<div className="wrap">
			<h1 className="page-title">{t('board.title')}</h1>
			<p className="page-sub">{t('board.subtitle')}</p>
			<div className="bar">
				<div className="tabs2">
					<span className={`chip ${category === '' ? 'on' : ''}`} onClick={() => pick('')}>
						{t('board.all')}
					</span>
					{Object.values(BoardArticleCategory).map((c) => (
						<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => pick(c)}>
							{t(`enum.${c}`)}
						</span>
					))}
				</div>
				<div className="grow" />
				<form onSubmit={searchHandler} style={{ display: 'flex', gap: 8 }}>
					<input className="field" style={{ width: 240 }} placeholder={t('board.search')} value={text} onChange={(e) => setText(e.target.value)} />
				</form>
				<select
					className="field"
					style={{ width: 170, fontWeight: 600 }}
					value={sort}
					onChange={(e) => {
						setSort(e.target.value);
						setPage(1);
					}}
				>
					{sorts.map((s) => (
						<option key={s.value} value={s.value}>
							{t(s.label)}
						</option>
					))}
				</select>
			</div>
			<div className="board">
				<div>
					<div className="card" style={{ opacity: loading && articles.length ? 0.6 : 1 }}>
						{articles.map((a) => (
							<div key={a._id} className="post">
								<ArticleThumb id={a._id} image={a.articleImage} category={a.articleCategory} />
								<div>
									<span className="cat">{t(`enum.${a.articleCategory}`)}</span>
									<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
										<h3>{a.articleTitle}</h3>
									</Link>
									<p>{a.articleContent}</p>
									<div className="by">
										<Avatar image={a.memberData?.memberImage} dealer={!!a.memberData?.agentCompany} />
										{dealerName(a.memberData)} {a.memberData?.agentCompany && <span className="role">{t('board.dealer')}</span>}
										<span>{fmt.timeAgo(a.createdAt)}</span>
									</div>
								</div>
								<div className="st">
									{t('count.views', { count: a.articleViews })}
									<br />
									{t('count.likes', { count: a.articleLikes })}
									<br />
									{t('count.comments', { count: a.articleComments })}
								</div>
							</div>
						))}
						{!loading && !articles.length && (
							<div className="empty" style={{ border: 0 }}>
								<h3>{t('board.noneFound')}</h3>
								<p>{search ? t('board.tryOther') : t('board.emptyCategory')}</p>
							</div>
						)}
					</div>
					<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
				</div>
				<aside>
					{canWrite ? (
						<div className="sidecard" style={{ background: 'var(--asphalt)', color: '#fff', borderColor: 'var(--asphalt)' }}>
							<h3>{t('board.shareTitle')}</h3>
							<p style={{ color: '#B9C1C8', fontSize: 14, marginBottom: 14 }}>{t('board.shareText')}</p>
							<Link href="/mypage?category=myArticles" className="btn primary sm">
								{t('board.write')}
							</Link>
						</div>
					) : (
						<div className="sidecard" style={{ background: 'var(--asphalt)', color: '#fff', borderColor: 'var(--asphalt)' }}>
							<h3>{t('board.wantWrite')}</h3>
							<p style={{ color: '#B9C1C8', fontSize: 14, marginBottom: 14 }}>
								{t('board.wantWriteText')}
							</p>
							<Link href="/account/join?mode=signup&type=AGENT" className="btn primary sm">
								{t('board.becomeDealer')}
							</Link>
						</div>
					)}
					<div className="sidecard">
						<h3>{t('board.mostRead')}</h3>
						{mostRead.map((a, i) => (
							<div key={a._id} className="toprow">
								<span className="n">{i + 1}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									{a.articleTitle}
								</Link>
								<small className="num">{fmt.number(a.articleViews)}</small>
							</div>
						))}
					</div>
				</aside>
			</div>
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(Community, 'title.community');
