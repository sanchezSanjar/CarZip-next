import { MeLiked } from '../like/like';
import { AgentPublic, TotalCounter } from '../member/member';

export interface MeFollowed {
	followerId: string;
	followingId: string;
	myFollowing: boolean;
}

export interface Follower {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	followerData?: AgentPublic;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Following {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	followingData?: AgentPublic;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Followers {
	list: Follower[];
	metaCounter?: TotalCounter[];
}

export interface Followings {
	list: Following[];
	metaCounter?: TotalCounter[];
}
