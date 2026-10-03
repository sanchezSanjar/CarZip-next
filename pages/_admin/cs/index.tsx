import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../apollo/admin/query';
import { CREATE_NOTICE, REMOVE_NOTICE_BY_ADMIN, UPDATE_NOTICE } from '../../../apollo/admin/mutation';
import { NoticeCategory, NoticeStatus } from '../../../libs/enums/notice.enum';
import { Notice, Notices } from '../../../libs/types/notice/notice';
import { getErrorMessage } from '../../../libs/auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { enumLabel, formatNumber } from '../../../libs/utils';
import { withTranslations } from '../../../libs/i18n';

// what each status means on the public Help page
const statusInfo: Record<NoticeStatus, { cls: string; label: string }> = {
	[NoticeStatus.ACTIVE]: { cls: 'active', label: 'Published' },
	[NoticeStatus.HOLD]: { cls: 'hold', label: 'Draft' },
	[NoticeStatus.DELETE]: { cls: 'sold', label: 'Hidden' },
};

/** admin: notices, FAQ and terms. Text is plain (shown as text on the Help page, never as HTML) */
const AdminCs: NextPage = () => {
	const [filter, setFilter] = useState<NoticeCategory | ''>('');
	const [editing, setEditing] = useState<Notice | null>(null);
	const [category, setCategory] = useState<NoticeCategory>(NoticeCategory.NOTICE);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [status, setStatus] = useState<NoticeStatus>(NoticeStatus.ACTIVE);
	const [saving, setSaving] = useState(false);

	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getAllNoticesByAdmin: Notices }>(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, sort: 'updatedAt', ...(filter ? { search: { noticeCategory: filter } } : {}) } },
	});
	const refetchQueries = [GET_ALL_NOTICES_BY_ADMIN];
	const [createNotice] = useMutation<{ createNotice: Notice }>(CREATE_NOTICE, { refetchQueries });
	const [updateNotice] = useMutation(UPDATE_NOTICE, { refetchQueries });
	const [removeNotice] = useMutation(REMOVE_NOTICE_BY_ADMIN, { refetchQueries });
	const rows = data?.getAllNoticesByAdmin.list ?? [];
	const valid = title.trim().length >= 1 && title.length <= 100 && content.trim().length >= 1 && content.length <= 20000;

	/** HANDLERS **/
	const edit = (n: Notice) => {
		setEditing(n);
		setCategory(n.noticeCategory);
		setTitle(n.noticeTitle);
		setContent(n.noticeContent);
		setStatus(n.noticeStatus);
	};
	const startNew = () => {
		setEditing(null);
		setCategory(NoticeCategory.NOTICE);
		setTitle('');
		setContent('');
		setStatus(NoticeStatus.ACTIVE);
	};

	const save = async () => {
		if (!valid || saving) return;
		setSaving(true);
		try {
			if (editing) {
				await updateNotice({ variables: { input: { _id: editing._id, noticeCategory: category, noticeTitle: title.trim(), noticeContent: content.trim(), noticeStatus: status } } });
			} else {
				const { data: created } = await createNotice({ variables: { input: { noticeCategory: category, noticeTitle: title.trim(), noticeContent: content.trim() } } });
				// a new entry starts in the server's default status; set the one chosen here
				if (created && created.createNotice.noticeStatus !== status) {
					await updateNotice({ variables: { input: { _id: created.createNotice._id, noticeStatus: status } } });
				}
			}
			await sweetTopSuccessAlert(editing ? 'Saved' : 'Entry created', 1000);
			startNew();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	const removeForGood = async () => {
		if (!editing) return;
		if (!(await sweetConfirmAlert(`Remove "${editing.noticeTitle}" for good? This can't be undone.`, 'Remove for good', true))) return;
		try {
			await removeNotice({ variables: { input: editing._id } });
			await sweetTopSuccessAlert('Removed', 1000);
			startNew();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Notices & FAQ</h1>
					<p>Published entries show on the public Help page. Drafts and hidden ones don&apos;t.</p>
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
							{rows.map((n) => (
								<tr key={n._id} style={n._id === editing?._id ? { background: '#F4F8FD' } : undefined}>
									<td>
										<span className="cat">{enumLabel(n.noticeCategory)}</span>
									</td>
									<td style={{ fontWeight: 600 }}>{n.noticeTitle}</td>
									<td>
										<span className={`pill ${statusInfo[n.noticeStatus].cls}`}>{statusInfo[n.noticeStatus].label}</span>
									</td>
									<td>{new Date(n.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											<button className="btn ghost sm" onClick={() => edit(n)}>
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
					<h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>{editing ? 'Edit entry' : 'New entry'}</h2>
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
					<textarea className="field" style={{ minHeight: 160, marginBottom: 6 }} maxLength={20000} value={content} onChange={(e) => setContent(e.target.value)} />
					<div className="hint" style={{ marginBottom: 14 }}>
						Plain text; line breaks are kept. {formatNumber(content.length)} of 20,000 characters.
					</div>
					<div className="label">Visibility</div>
					<div className="tabs2" style={{ marginBottom: 16 }}>
						{(editing ? Object.values(NoticeStatus) : [NoticeStatus.ACTIVE, NoticeStatus.HOLD]).map((s) => (
							<span key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
								{statusInfo[s].label}
							</span>
						))}
					</div>
					<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
						{editing?.noticeStatus === NoticeStatus.DELETE && (
							<button className="btn danger" onClick={removeForGood}>
								Remove for good
							</button>
						)}
						<button className="btn ghost" onClick={startNew}>
							Cancel
						</button>
						<button className="btn primary" disabled={!valid || saving} onClick={save}>
							{saving ? 'Saving…' : 'Save'}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutAdmin(AdminCs);
