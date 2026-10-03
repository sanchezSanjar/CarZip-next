import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutMember from '../../libs/components/layout/LayoutMember';
import TestDrives from '../../libs/components/mypage/TestDrives';
import MyCars from '../../libs/components/mypage/MyCars';
import AddNewCar from '../../libs/components/mypage/AddNewCar';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyFollows from '../../libs/components/mypage/MyFollows';
import MyComments from '../../libs/components/mypage/MyComments';
import MyBlocks from '../../libs/components/mypage/MyBlocks';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyNotifications from '../../libs/components/mypage/MyNotifications';

/** /mypage?category=... : one section of the dealer's or buyer's own pages */
const MyPage: NextPage = () => {
	const router = useRouter();
	const category = typeof router.query.category === 'string' ? router.query.category : 'testDrives';

	if (!router.isReady) return null;

	return (
		<>
			{category === 'testDrives' && <TestDrives />}
			{category === 'myCars' && <MyCars />}
			{category === 'addCar' && <AddNewCar />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'recentlyVisited' && <MyFavorites visited />}
			{category === 'myArticles' && <MyArticles />}
			{category === 'follows' && <MyFollows />}
			{category === 'comments' && <MyComments />}
			{category === 'blocked' && <MyBlocks />}
			{category === 'myProfile' && <MyProfile />}
			{category === 'notifications' && <MyNotifications />}
		</>
	);
};

export default withLayoutMember(MyPage);
