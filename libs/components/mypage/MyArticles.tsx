import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { BoardArticle, BoardArticles } from '../../types/board-article/board-article';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { uploadImages } from '../../upload';
import { enumLabel, formatNumber } from '../../utils';

/** dealer (and admin): write, edit and delete own articles; they appear in Community and on the dealer page */
const MyArticles = () => {
	const user = useReactiveVar(userVar);
	const [editing, setEditing] = useState<BoardArticle | null>(null);
	const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.RECOMMEND);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [image, setImage] = useState('');
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);

	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', search: { memberId: user._id } } },
		skip: !user._id,
	});
	const [createArticle] = useMutation(CREATE_BOARD_ARTICLE, { refetchQueries: [GET_BOARD_ARTICLES] });
	const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE, { refetchQueries: [GET_BOARD_ARTICLES] });
	const mine = data?.getBoardArticles.list ?? [];

	const valid = title.trim().length >= 3 && title.length <= 100 && content.trim().length >= 3 && content.length <= 5000;

	/** HANDLERS **/
	const reset = () => {
		setEditing(null);
		setCategory(BoardArticleCategory.RECOMMEND);
		setTitle('');
		setContent('');
		setImage('');
	};

	const startEdit = (a: BoardArticle) => {
		setEditing(a);
		setCategory(a.articleCategory);
		setTitle(a.articleTitle);
		setContent(a.articleContent);
		setImage(a.articleImage ?? '');
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const addPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		setUploading(true);
		try {
			const [img] = await uploadImages([file], 'article');
			setImage(img.url);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setUploading(false);
		}
	};

	const publish = async () => {
		if (!valid || saving) return;
		setSaving(true);
		try {
			if (editing) {
				// the category can't be changed after publishing
				await updateArticle({ variables: { input: { _id: editing._id, articleTitle: title.trim(), articleContent: content.trim(), articleImage: image || undefined } } });
				await sweetTopSuccessAlert('Article updated', 1200);
			} else {
				await createArticle({ variables: { input: { articleCategory: category, articleTitle: title.trim(), articleContent: content.trim(), ...(image ? { articleImage: image } : {}) } } });
				await sweetTopSuccessAlert('Article published', 1200);
			}
			reset();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const remove = async (a: BoardArticle) => {
		if (!(await sweetConfirmAlert(`Delete "${a.articleTitle}"? It disappears from Community.`, 'Delete', true))) return;
		try {
			await updateArticle({ variables: { input: { _id: a._id, articleStatus: BoardArticleStatus.DELETE } } });
			if (editing?._id === a._id) reset();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Articles</h1>
					<p>Posts appear in Community and on your dealer page.</p>
				</div>
				<Link href={`/agent/detail?id=${user._id}`} className="btn ghost">
					View my dealer page
				</Link>
			</div>
			<div className="ed-grid">
				<div className="editor">
					<div className="label">{editing ? `Editing: ${enumLabel(category)}` : 'Category'}</div>
					{!editing && (
						<div className="chips">
							{Object.values(BoardArticleCategory).map((c) => (
								<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
									{enumLabel(c)}
								</span>
							))}
						</div>
					)}
					<input
						className="titlein"
						style={{ border: 0, borderBottom: '1px solid var(--line-2)', outline: 'none', width: '100%', background: 'none' }}
						placeholder="Title (3 to 100 characters)"
						maxLength={100}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0' }}>
						{image && (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={image} alt="" style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
						)}
						<label className="btn ghost sm" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
							{uploading ? 'Uploading…' : image ? 'Change photo' : 'Add a photo'}
							<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={addPhoto} />
						</label>
						{image && (
							<button className="btn ghost sm" onClick={() => setImage('')}>
								Remove photo
							</button>
						)}
					</div>
					<textarea
						className="body-text"
						style={{ border: 0, outline: 'none', width: '100%', minHeight: 260, resize: 'vertical', fontFamily: 'inherit' }}
						placeholder="Write your article. Line breaks are kept."
						maxLength={5000}
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<div className="hint">{formatNumber(content.length)} of 5,000 characters</div>
					<div className="pub">
						<button className="btn ghost" onClick={reset}>
							{editing ? 'Cancel editing' : 'Clear'}
						</button>
						<button className="btn primary" disabled={!valid || saving || uploading} onClick={publish}>
							{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish article'}
						</button>
					</div>
				</div>
				<div className="block mini-list" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							Your articles<span>{data?.getBoardArticles.metaCounter?.[0]?.total ?? 0}</span>
						</h2>
					</div>
					{mine.map((a) => (
						<div key={a._id} className="row" style={{ flexWrap: 'wrap' }}>
							<div style={{ flex: 1, minWidth: 0 }}>
								<span className="cat">{enumLabel(a.articleCategory)}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									<b style={{ marginTop: 6 }}>{a.articleTitle}</b>
								</Link>
								<small>
									{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {formatNumber(a.articleViews)} views ·{' '}
									{a.articleLikes} likes · {a.articleComments} comments
								</small>
							</div>
							<div className="rowacts">
								<button className="btn ghost sm" onClick={() => startEdit(a)}>
									Edit
								</button>
								<button className="btn danger sm" onClick={() => remove(a)}>
									Delete
								</button>
							</div>
						</div>
					))}
					{!mine.length && (
						<p className="muted" style={{ padding: '0 18px 18px', fontSize: 14 }}>
							You haven&apos;t written anything yet.
						</p>
					)}
				</div>
			</div>
		</>
	);
};

export default MyArticles;
