import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutMember from '../../libs/components/layout/LayoutMember';
import TestDrives from '../../libs/components/mypage/TestDrives';
import MyCars from '../../libs/components/mypage/MyCars';

/** /mypage?category=... : one section of the dealer's or buyer's own pages */
const MyPage: NextPage = () => {
	const router = useRouter();
	const category = typeof router.query.category === 'string' ? router.query.category : 'testDrives';

	if (!router.isReady) return null;

	return (
		<>
			{category === 'testDrives' && <TestDrives />}
			{category === 'myCars' && <MyCars />}
		</>
	);
};

export default withLayoutMember(MyPage);
