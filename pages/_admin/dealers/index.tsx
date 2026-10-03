import React from 'react';
import { NextPage } from 'next';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import MemberList from '../../../libs/components/admin/MemberList';
import { MemberType } from '../../../libs/enums/member.enum';

const AdminDealers: NextPage = () => {
	return <MemberList memberType={MemberType.AGENT} />;
};

export default withLayoutAdmin(AdminDealers);
