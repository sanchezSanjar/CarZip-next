import { Direction } from '../../enums/common.enum';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

export interface NoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: NoticeSearch;
}

export interface NoticeSearch {
	noticeCategory?: NoticeCategory;
	noticeStatus?: NoticeStatus;
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeTitle: string;
	noticeContent: string;
}
