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
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

/** dealer (and admin): write, edit and delete own articles; they appear in Community and on the dealer page */
const MyArticles = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
				await sweetTopSuccessAlert(t('art.updated'), 1200);
			} else {
				await createArticle({ variables: { input: { articleCategory: category, articleTitle: title.trim(), articleContent: content.trim(), ...(image ? { articleImage: image } : {}) } } });
				await sweetTopSuccessAlert(t('art.published'), 1200);
			}
			reset();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const remove = async (a: BoardArticle) => {
		if (!(await sweetConfirmAlert(t('art.deleteQ', { title: a.articleTitle }), t('my.delete'), true))) return;
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
					<h1>{t('menu.articles')}</h1>
					<p>{t('art.sub')}</p>
				</div>
				<Link href={`/agent/detail?id=${user._id}`} className="btn ghost">
					{t('my.viewDealerPage')}
				</Link>
			</div>
			<div className="ed-grid">
				<div className="editor">
					<div className="label">{editing ? t('art.editing', { category: t(`enum.${category}`) }) : t('art.category')}</div>
					{!editing && (
						<div className="chips">
							{Object.values(BoardArticleCategory).map((c) => (
								<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
									{t(`enum.${c}`)}
								</span>
							))}
						</div>
					)}
					<input
						className="titlein"
						style={{ border: 0, borderBottom: '1px solid var(--line-2)', outline: 'none', width: '100%', background: 'none' }}
						placeholder={t('art.titlePh')}
						maxLength={100}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '12px 0' }}>
						{image && (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={image} alt="" style={{ width: 120, height: 68, objectFit: 'contain', background: '#E4E7EA', borderRadius: 8 }} />
						)}
						<label className="btn ghost sm" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
							{uploading ? t('my.uploading') : image ? t('my.changePhoto') : t('art.addPhoto')}
							<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={addPhoto} />
						</label>
						{image && (
							<button className="btn ghost sm" onClick={() => setImage('')}>
								{t('my.removePhoto')}
							</button>
						)}
					</div>
					<textarea
						className="body-text"
						style={{ border: 0, outline: 'none', width: '100%', minHeight: 260, resize: 'vertical', fontFamily: 'inherit' }}
						placeholder={t('art.bodyPh')}
						maxLength={5000}
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<div className="hint">{t('my.charsOf', { count: content.length, max: fmt.number(5000) })}</div>
					<div className="pub">
						{/* say what still blocks publishing, instead of a silently greyed-out button */}
						{!valid && (
							<span className="pub-hint">
								{title.trim().length < 3 || title.length > 100 ? t('art.needTitle') : t('art.needText')}
							</span>
						)}
						<button className="btn ghost" onClick={reset}>
							{editing ? t('art.cancelEditing') : t('art.clear')}
						</button>
						<button className="btn primary" disabled={!valid || saving || uploading} onClick={publish}>
							{saving ? t('my.saving') : editing ? t('my.saveChanges') : t('art.publish')}
						</button>
					</div>
				</div>
				<div className="block mini-list" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							{t('art.yours')}
							<span>{data?.getBoardArticles.metaCounter?.[0]?.total ?? 0}</span>
						</h2>
					</div>
					{mine.map((a) => (
						<div key={a._id} className="row" style={{ flexWrap: 'wrap' }}>
							<div style={{ flex: 1, minWidth: 0 }}>
								<span className="cat">{t(`enum.${a.articleCategory}`)}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									<b style={{ marginTop: 6 }}>{a.articleTitle}</b>
								</Link>
								<small>
									{fmt.date(a.createdAt)} · {t('count.views', { count: a.articleViews })} · {t('count.likes', { count: a.articleLikes })} ·{' '}
									{t('count.comments', { count: a.articleComments })}
								</small>
							</div>
							<div className="rowacts">
								<button className="btn ghost sm" onClick={() => startEdit(a)}>
									{t('my.edit')}
								</button>
								<button className="btn danger sm" onClick={() => remove(a)}>
									{t('my.delete')}
								</button>
							</div>
						</div>
					))}
					{!mine.length && (
						<p className="muted" style={{ padding: '0 18px 18px', fontSize: 14 }}>
							{t('art.none')}
						</p>
					)}
				</div>
			</div>
		</>
	);
};

export default MyArticles;
