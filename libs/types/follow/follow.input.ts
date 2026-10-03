export interface FollowInquiry {
	page: number;
	limit: number;
	search: FollowSearch;
}

export interface FollowSearch {
	followingId?: string;
	followerId?: string;
}
