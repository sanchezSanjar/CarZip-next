import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../apollo/store';
import { MemberType } from '../../libs/enums/member.enum';
import withLayoutMember from '../../libs/components/layout/LayoutMember';
import TestDrives from '../../libs/components/mypage/TestDrives';
import MyCars from '../../libs/components/mypage/MyCars';
import AddNewCar from '../../libs/components/mypage/AddNewCar';
import EditCar from '../../libs/components/mypage/EditCar';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import MyArticles from '../../libs/components/mypage/MyArticles';
import MyFollows from '../../libs/components/mypage/MyFollows';
import MyComments from '../../libs/components/mypage/MyComments';
import MyWrittenComments from '../../libs/components/mypage/MyWrittenComments';
import MyBlocks from '../../libs/components/mypage/MyBlocks';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyNotifications from '../../libs/components/mypage/MyNotifications';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';

/** /mypage?category=... : one section of the dealer's or buyer's own pages */
const MyPage: NextPage = () => {
	const router = useRouter();
	const addressReady = useAddressReady();
	const isAgent = useReactiveVar(userVar).memberType === MemberType.AGENT;
	const category = typeof router.query.category === 'string' ? router.query.category : 'testDrives';

	if (!addressReady) return null;

	return (
		<>
			{category === 'testDrives' && <TestDrives />}
			{category === 'myCars' && <MyCars />}
			{category === 'addCar' && <AddNewCar />}
			{category === 'editCar' && <EditCar carId={typeof router.query.carId === 'string' ? router.query.carId : ''} />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'recentlyVisited' && <MyFavorites visited />}
			{category === 'myArticles' && <MyArticles />}
			{category === 'follows' && <MyFollows />}
			{/* dealers also see comments on their own cars; buyers only the ones they wrote */}
			{category === 'comments' && (isAgent ? <MyComments /> : <MyWrittenComments withHeader />)}
			{category === 'blocked' && <MyBlocks />}
			{category === 'myProfile' && <MyProfile />}
			{category === 'notifications' && <MyNotifications />}
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutMember(MyPage);
