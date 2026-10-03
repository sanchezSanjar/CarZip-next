import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}
