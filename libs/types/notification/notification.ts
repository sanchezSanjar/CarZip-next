import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { AgentPublic, TotalCounter } from '../member/member';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	carId?: string;
	articleId?: string;
	createdAt: Date;
	updatedAt: Date;
	authorData?: AgentPublic;
}

export interface Notifications {
	list: Notification[];
	metaCounter?: TotalCounter[];
}
