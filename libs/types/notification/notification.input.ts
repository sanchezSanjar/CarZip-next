import { NotificationGroup, NotificationStatus } from '../../enums/notification.enum';

export interface NotificationsInquiry {
	page: number;
	limit: number;
	search?: NISearch;
}

export interface NISearch {
	notificationStatus?: NotificationStatus;
	notificationGroup?: NotificationGroup;
}

export interface NotificationsRead {
	notificationIds?: string[];
}
