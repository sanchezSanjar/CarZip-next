import React, { useState } from 'react';
import { NextPage } from 'next';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { NoticeCategory, NoticeStatus } from '../../../libs/enums/notice.enum';
import { enumLabel } from '../../../libs/utils';

// sample entries from the UI design
const entries = [
	{ _id: 'n1', category: NoticeCategory.FAQ, title: 'How do I buy a car on CarZip?', status: NoticeStatus.ACTIVE, updated: '2 Aug', content: '' },
	{ _id: 'n2', category: NoticeCategory.FAQ, title: 'How does a test drive request work?', status: NoticeStatus.ACTIVE, updated: '2 Aug', content: '' },
	{ _id: 'n3', category: NoticeCategory.NOTICE, title: 'Dealer applications are reviewed within 24 hours', status: NoticeStatus.ACTIVE, updated: '20 Sep', content: '' },
	{ _id: 'n4', category: NoticeCategory.NOTICE, title: 'Scheduled maintenance, 5 Oct 02:00 to 04:00', status: NoticeStatus.HOLD, updated: '12 Sep', content: 'CarZip will be unavailable on Monday 5 October from 02:00 to 04:00 while we update our servers.' },
	{ _id: 'n5', category: NoticeCategory.TERMS, title: 'Terms of use, version 1.2', status: NoticeStatus.ACTIVE, updated: '1 Sep', content: '' },
];

// what each status means on the public Help page
const statusInfo: Record<NoticeStatus, { cls: string; label: string }> = {
	[NoticeStatus.ACTIVE]: { cls: 'active', label: 'Published' },
	[NoticeStatus.HOLD]: { cls: 'hold', label: 'Draft' },
	[NoticeStatus.DELETE]: { cls: 'sold', label: 'Hidden' },
};

/** admin: notices, FAQ and terms. Text is plain (shown as text on the Help page, never as HTML) */
const AdminCs: NextPage = () => {
	const [filter, setFilter] = useState<NoticeCategory | ''>('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [category, setCategory] = useState<NoticeCategory>(NoticeCategory.NOTICE);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [status, setStatus] = useState<NoticeStatus>(NoticeStatus.HOLD);
	const rows = entries.filter((e) => !filter || e.category === filter);
	const valid = title.trim().length >= 1 && title.length <= 100 && content.trim().length >= 1 && content.length <= 20000;

	const edit = (e: (typeof entries)[number]) => {
		setEditingId(e._id);
		setCategory(e.category);
		setTitle(e.title);
		setContent(e.content);
		setStatus(e.status);
	};
	const startNew = () => {
		setEditingId(null);
		setCategory(NoticeCategory.NOTICE);
		setTitle('');
		setContent('');
		setStatus(NoticeStatus.HOLD);
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Notices & FAQ</h1>
					<p>Everything published here shows on the public Help page.</p>
				</div>
				<button className="btn primary" onClick={startNew}>
					New entry
				</button>
			</div>
			<div className="twocol" style={{ gridTemplateColumns: '1fr 440px', alignItems: 'start' }}>
				<div className="block" style={{ margin: 0 }}>
					<div className="block-head">
						<div className="tabs2">
							<span className={`chip ${filter === '' ? 'on' : ''}`} onClick={() => setFilter('')}>
								All
							</span>
							{Object.values(NoticeCategory).map((c) => (
								<span key={c} className={`chip ${filter === c ? 'on' : ''}`} onClick={() => setFilter(c)}>
									{enumLabel(c)}
								</span>
							))}
						</div>
					</div>
					<table>
						<thead>
							<tr>
								<th>Type</th>
								<th>Title</th>
								<th>Status</th>
								<th>Updated</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{rows.map((e) => (
								<tr key={e._id} style={e._id === editingId ? { background: '#F4F8FD' } : undefined}>
									<td>
										<span className="cat">{enumLabel(e.category)}</span>
									</td>
									<td style={{ fontWeight: 600 }}>{e.title}</td>
									<td>
										<span className={`pill ${statusInfo[e.status].cls}`}>{statusInfo[e.status].label}</span>
									</td>
									<td>{e.updated}</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											<button className="btn ghost sm" onClick={() => edit(e)}>
												Edit
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="ed2">
					<h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>{editingId ? 'Edit entry' : 'New entry'}</h2>
					<div className="label">Type</div>
					<div className="tabs2" style={{ marginBottom: 14 }}>
						{Object.values(NoticeCategory).map((c) => (
							<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
								{enumLabel(c)}
							</span>
						))}
					</div>
					<div className="label">Title</div>
					<input className="field" style={{ marginBottom: 14 }} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
					<div className="label">Text</div>
					<textarea className="field" style={{ minHeight: 130, marginBottom: 14 }} maxLength={20000} value={content} onChange={(e) => setContent(e.target.value)} />
					<div className="label">Visibility</div>
					<div className="tabs2" style={{ marginBottom: 16 }}>
						{(editingId ? Object.values(NoticeStatus) : [NoticeStatus.HOLD, NoticeStatus.ACTIVE]).map((s) => (
							<span key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
								{statusInfo[s].label}
							</span>
						))}
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
						{editingId && status === NoticeStatus.DELETE && <button className="btn danger">Remove for good</button>}
						<button className="btn ghost" onClick={startNew}>
							Cancel
						</button>
						<button className="btn primary" disabled={!valid}>
							Save
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default withLayoutAdmin(AdminCs);
