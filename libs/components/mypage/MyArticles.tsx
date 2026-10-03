import React, { useState } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { sampleArticles } from '../../sampleData';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { enumLabel, formatNumber } from '../../utils';

/** dealer: write an article and see own articles (they appear in Community and on the dealer page) */
const MyArticles = () => {
	const user = useReactiveVar(userVar);
	const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.RECOMMEND);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const mine = sampleArticles.filter((a) => a.memberId === 'd1');

	const valid = title.trim().length >= 3 && title.length <= 100 && content.trim().length >= 3 && content.length <= 5000;
	const reset = () => {
		setTitle('');
		setContent('');
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
					<div className="label">Category</div>
					<div className="chips">
						{Object.values(BoardArticleCategory).map((c) => (
							<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
								{enumLabel(c)}
							</span>
						))}
					</div>
					<input
						className="titlein"
						style={{ border: 0, borderBottom: '1px solid var(--line-2)', outline: 'none', width: '100%', background: 'none' }}
						placeholder="Title"
						maxLength={100}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<label className="btn ghost sm" style={{ margin: '12px 0' }}>
						Add a photo
						<input type="file" accept="image/jpeg,image/png,image/webp" hidden />
					</label>
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
							Cancel
						</button>
						<button className="btn primary" disabled={!valid}>
							Publish article
						</button>
					</div>
				</div>
				<div className="block mini-list" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							Your articles<span>{mine.length}</span>
						</h2>
					</div>
					{mine.map((a) => (
						<div key={a._id} className="row">
							<div>
								<span className="cat">{enumLabel(a.articleCategory)}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									<b style={{ marginTop: 6 }}>{a.articleTitle}</b>
								</Link>
								<small>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>
							</div>
							<div className="stats">
								<span className="num">{formatNumber(a.articleViews)}</span> views
								<br />
								<span className="num">{a.articleLikes}</span> likes, <span className="num">{a.articleComments}</span> comments
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default MyArticles;
