import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLE, GET_CAR, GET_COMMENTS, GET_MEMBER } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { CommentGroup } from '../../enums/comment.enum';
import { Comments } from '../../types/comment/comment';
import { getErrorMessage } from '../../auth';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import { dealerName } from '../../utils';
import Avatar from './Avatar';
import { useMyImage } from '../../hooks/useMyImage';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const PAGE = 10;

interface CommentSectionProps {
	group: CommentGroup;
	refId: string; // the car or article
	ownerId: string; // whose car or article it is, to mark their replies
	placeholder?: string;
}

/** comments under a car or an article: read, write, edit your own. Only admins delete */
const CommentSection = ({ group, refId, ownerId, placeholder }: CommentSectionProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const user = useReactiveVar(userVar);
	const myImage = useMyImage();
	const [limit, setLimit] = useState(PAGE);
	const [text, setText] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState('');
	const [sending, setSending] = useState(false);

	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getComments: Comments }>(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit, sort: 'createdAt', direction: 'DESC', search: { commentRefId: refId } } },
	});
	// the count on the car or article changes too
	const counted = { [CommentGroup.CAR]: GET_CAR, [CommentGroup.ARTICLE]: GET_BOARD_ARTICLE, [CommentGroup.MEMBER]: GET_MEMBER }[group];
	const refetchQueries = [GET_COMMENTS, counted];
	const [createComment] = useMutation(CREATE_COMMENT, { refetchQueries });
	const [updateComment] = useMutation(UPDATE_COMMENT, { refetchQueries: [GET_COMMENTS] });
	const comments = data?.getComments.list ?? [];
	const total = data?.getComments.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const post = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user._id) {
			if (await sweetLoginConfirmAlert(t('comments.logInPrompt'), t('follow.logIn'))) await router.push('/account/join?mode=login');
			return;
		}
		if (!text.trim()) return;
		setSending(true);
		try {
			await createComment({ variables: { input: { commentGroup: group, commentRefId: refId, commentContent: text.trim() } } });
			setText('');
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err)); // e.g. blocked by the dealer
		} finally {
			setSending(false);
		}
	};

	const saveEdit = async (id: string) => {
		if (!editText.trim()) return;
		try {
			await updateComment({ variables: { input: { _id: id, commentContent: editText.trim() } } });
			setEditingId(null);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<div className="section">
			<h2>
				{t('comments.title')} <span className="num">{total}</span>
			</h2>
			<form className="comment-box" onSubmit={post}>
				<Avatar image={myImage} dealer={user.memberType === 'AGENT'} />
				<textarea
					className="ta"
					style={{ border: 0, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
					placeholder={user._id ? placeholder ?? t('comments.write') : t('comments.logInToWrite')}
					maxLength={500}
					value={text}
					disabled={!user._id}
					onChange={(e) => setText(e.target.value)}
				/>
				<button className="btn dark sm" disabled={sending || (!!user._id && !text.trim())}>
					{user._id ? t('comments.post') : t('comments.logIn')}
				</button>
			</form>
			{comments.map((c) => {
				const mine = c.memberId === user._id;
				const isOwner = c.memberId === ownerId;
				const dealer = !!c.memberData?.agentCompany;
				return (
					<div key={c._id} className="comment">
						<Avatar image={c.memberData?.memberImage} dealer={dealer} />
						<div style={{ flex: 1 }}>
							<div className="who">
								{dealerName(c.memberData)} {isOwner ? <span className="role">{dealer ? t('comments.dealer') : t('comments.author')}</span> : dealer && <span className="role">{t('comments.dealer')}</span>}{' '}
								<small>
									{fmt.timeAgo(c.createdAt)}
									{c.updatedAt !== c.createdAt && ` · ${t('comments.edited')}`}
								</small>
								{mine && editingId !== c._id && (
									<a
										style={{ fontSize: 13, marginLeft: 'auto', cursor: 'pointer' }}
										onClick={() => {
											setEditingId(c._id);
											setEditText(c.commentContent);
										}}
									>
										{t('comments.edit')}
									</a>
								)}
							</div>
							{editingId === c._id ? (
								<div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
									<input className="field" maxLength={500} value={editText} onChange={(e) => setEditText(e.target.value)} />
									<button className="btn dark sm" onClick={() => saveEdit(c._id)}>
										{t('comments.save')}
									</button>
									<button className="btn ghost sm" onClick={() => setEditingId(null)}>
										{t('comments.cancel')}
									</button>
								</div>
							) : (
								<p>{c.commentContent}</p>
							)}
						</div>
					</div>
				);
			})}
			{comments.length < total && (
				<button className="btn ghost" style={{ marginTop: 14 }} onClick={() => setLimit(limit + PAGE)}>
					{t('comments.showMore')}
				</button>
			)}
		</div>
	);
};

export default CommentSection;
