import React from 'react';
import { NextPage } from 'next';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import MemberList from '../../../libs/components/admin/MemberList';
import { MemberType } from '../../../libs/enums/member.enum';

const AdminMembers: NextPage = () => {
	return <MemberList memberType={MemberType.USER} />;
};

export default withLayoutAdmin(AdminMembers);
