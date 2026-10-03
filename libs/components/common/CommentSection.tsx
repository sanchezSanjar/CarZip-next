import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_CAR, GET_BOARD_ARTICLE, GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../../apollo/user/mutation';
import { CommentGroup } from '../../enums/comment.enum';
import { Comments } from '../../types/comment/comment';
import { getErrorMessage } from '../../auth';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import { dealerName, initial, timeAgo } from '../../utils';

const PAGE = 10;

interface CommentSectionProps {
	group: CommentGroup;
	refId: string; // the car or article
	ownerId: string; // whose car or article it is, to mark their replies
	placeholder?: string;
}

/** comments under a car or an article: read, write, edit your own. Only admins delete */
const CommentSection = ({ group, refId, ownerId, placeholder = 'Write a comment' }: CommentSectionProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
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
	const refetchQueries = [GET_COMMENTS, group === CommentGroup.CAR ? GET_CAR : GET_BOARD_ARTICLE];
	const [createComment] = useMutation(CREATE_COMMENT, { refetchQueries });
	const [updateComment] = useMutation(UPDATE_COMMENT, { refetchQueries: [GET_COMMENTS] });
	const comments = data?.getComments.list ?? [];
	const total = data?.getComments.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const post = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to write a comment.')) await router.push('/account/join?mode=login');
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
				Comments <span className="num">{total}</span>
			</h2>
			<form className="comment-box" onSubmit={post}>
				<div className="avatar user">{initial(user.memberNick || 'G')}</div>
				<textarea
					className="ta"
					style={{ border: 0, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
					placeholder={user._id ? placeholder : 'Log in to write a comment'}
					maxLength={500}
					value={text}
					disabled={!user._id}
					onChange={(e) => setText(e.target.value)}
				/>
				<button className="btn dark sm" disabled={sending || (!!user._id && !text.trim())}>
					{user._id ? 'Post comment' : 'Log in to comment'}
				</button>
			</form>
			{comments.map((c) => {
				const mine = c.memberId === user._id;
				const isOwner = c.memberId === ownerId;
				const dealer = !!c.memberData?.agentCompany;
				return (
					<div key={c._id} className="comment">
						<div className={`avatar ${dealer ? '' : 'user'}`}>{initial(dealerName(c.memberData))}</div>
						<div style={{ flex: 1 }}>
							<div className="who">
								{dealerName(c.memberData)} {isOwner ? <span className="role">{dealer ? 'Dealer' : 'Author'}</span> : dealer && <span className="role">Dealer</span>}{' '}
								<small>
									{timeAgo(c.createdAt)}
									{c.updatedAt !== c.createdAt && ' · edited'}
								</small>
								{mine && editingId !== c._id && (
									<a
										style={{ fontSize: 13, marginLeft: 'auto', cursor: 'pointer' }}
										onClick={() => {
											setEditingId(c._id);
											setEditText(c.commentContent);
										}}
									>
										Edit
									</a>
								)}
							</div>
							{editingId === c._id ? (
								<div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
									<input className="field" maxLength={500} value={editText} onChange={(e) => setEditText(e.target.value)} />
									<button className="btn dark sm" onClick={() => saveEdit(c._id)}>
										Save
									</button>
									<button className="btn ghost sm" onClick={() => setEditingId(null)}>
										Cancel
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
					Show more comments
				</button>
			)}
		</div>
	);
};

export default CommentSection;
