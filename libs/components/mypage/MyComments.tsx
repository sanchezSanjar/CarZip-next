import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_AGENT_CARS, GET_BOARD_ARTICLES, GET_COMMENTS } from '../../../apollo/user/query';
import { BLOCK_MEMBER, CREATE_COMMENT } from '../../../apollo/user/mutation';
import { CommentGroup } from '../../enums/comment.enum';
import { CarsPage } from '../../types/car/car';
import { BoardArticles } from '../../types/board-article/board-article';
import { Comments } from '../../types/comment/comment';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { dealerName } from '../../utils';
import CarPhoto from '../common/CarPhoto';
import Avatar from '../common/Avatar';
import { useMyImage } from '../../hooks/useMyImage';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

interface Target {
	id: string;
	group: CommentGroup;
	title: string;
	count: number;
	image?: string;
	href: string;
}

/**
 * Dealer: comments on own cars and articles. Pick one on the left, read and reply on the right.
 * Only admins can delete comments; the dealer can block the writer.
 */
const MyComments = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const user = useReactiveVar(userVar);
	const myImage = useMyImage();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [reply, setReply] = useState('');
	const [sending, setSending] = useState(false);

	/** APOLLO REQUESTS **/
	const { data: carsData } = useQuery<{ getAgentCars: CarsPage }>(GET_AGENT_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50 } },
	});
	const { data: articlesData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50, search: { memberId: user._id } } },
		skip: !user._id,
	});

	const targets: Target[] = [
		...(carsData?.getAgentCars.list ?? []).map((c) => ({ id: c._id, group: CommentGroup.CAR, title: c.carTitle, count: c.carComments, image: c.carImages[0], href: `/car/detail?id=${c._id}` })),
		...(articlesData?.getBoardArticles.list ?? []).map((a) => ({ id: a._id, group: CommentGroup.ARTICLE, title: a.articleTitle, count: a.articleComments, image: a.articleImage, href: `/community/detail?id=${a._id}` })),
	].sort((a, b) => b.count - a.count);
	const selected = targets.find((x) => x.id === selectedId) ?? targets.find((x) => x.count > 0) ?? targets[0];

	const { data: commentsData, loading } = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50, sort: 'createdAt', direction: 'ASC', search: { commentRefId: selected?.id ?? '' } } },
		skip: !selected,
	});
	const refetchQueries = [GET_COMMENTS, GET_AGENT_CARS, GET_BOARD_ARTICLES];
	const [createComment] = useMutation(CREATE_COMMENT, { refetchQueries });
	const [blockMember] = useMutation(BLOCK_MEMBER);
	const comments = commentsData?.getComments.list ?? [];

	/** HANDLERS **/
	const sendReply = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selected || !reply.trim()) return;
		setSending(true);
		try {
			await createComment({ variables: { input: { commentGroup: selected.group, commentRefId: selected.id, commentContent: reply.trim() } } });
			setReply('');
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSending(false);
		}
	};

	const block = async (memberId: string, name: string) => {
		if (!(await sweetConfirmAlert(t('dealers.blockQ', { name }), t('dealers.block'), true))) return;
		try {
			await blockMember({ variables: { input: memberId } });
			await sweetTopSuccessAlert(t('my.blocked'), 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{t('menu.comments')}</h1>
					<p>{t('cm.sub')}</p>
				</div>
			</div>
			<div className="banner info" style={{ marginBottom: 18 }}>
				<span className="i">i</span>
				<div>
					<b>{t('cm.troubleTitle')}</b>
					{t('cm.troubleText')}
				</div>
			</div>
			{!targets.length ? (
				<div className="empty">
					<h3>{t('cm.nothing')}</h3>
					<p>{t('cm.nothingText')}</p>
				</div>
			) : (
				<div className="comments-wrap">
					<div className="block" style={{ margin: 0 }}>
						{targets.map((target) => (
							<div key={target.id} className={`ctarget ${selected?.id === target.id ? 'on' : ''}`} role="button" onClick={() => setSelectedId(target.id)}>
								{target.group === CommentGroup.CAR ? <CarPhoto image={target.image} className="thumb" /> : <span className="cat">{t('cm.article')}</span>}
								<b>{target.title}</b>
								<span className="num">{target.count}</span>
							</div>
						))}
					</div>
					{selected && (
						<div className="block" style={{ margin: 0, padding: '6px 20px 20px' }}>
							<div className="block-head" style={{ padding: '12px 0' }}>
								<h2>{selected.title}</h2>
								<Link href={selected.href} className="btn ghost sm">
									{t('cm.open')}
								</Link>
							</div>
							{comments.map((c) => {
								const mine = c.memberId === user._id;
								const dealer = !!c.memberData?.agentCompany;
								return (
									<div key={c._id} className="comment">
										<Avatar image={c.memberData?.memberImage} dealer={dealer} />
										<div style={{ flex: 1 }}>
											<div className="who">
												{dealerName(c.memberData)} {mine ? <span className="role">{t('cm.you')}</span> : dealer && <span className="role">{t('board.dealer')}</span>}{' '}
												<small>{fmt.timeAgo(c.createdAt)}</small>
											</div>
											<p>{c.commentContent}</p>
										</div>
										{!mine && (
											<button className="btn danger sm" style={{ alignSelf: 'center' }} onClick={() => block(c.memberId, dealerName(c.memberData))}>
												{t('dealers.block')}
											</button>
										)}
									</div>
								);
							})}
							{!loading && !comments.length && <p className="muted" style={{ padding: '10px 0' }}>{t('cm.noneHere')}</p>}
							<form className="comment-box" style={{ marginTop: 16 }} onSubmit={sendReply}>
								<Avatar image={myImage} dealer />
								<textarea
									className="ta"
									style={{ border: 0, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
									placeholder={t('cm.replyPh')}
									maxLength={500}
									value={reply}
									onChange={(e) => setReply(e.target.value)}
								/>
								<button className="btn dark sm" disabled={!reply.trim() || sending}>
									{t('cm.reply')}
								</button>
							</form>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default MyComments;
