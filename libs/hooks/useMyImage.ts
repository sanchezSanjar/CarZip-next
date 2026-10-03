import { useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../apollo/store';
import { GET_MEMBER } from '../../apollo/user/query';
import { Member } from '../types/member/member';

/** the logged-in member's photo (the token only carries the id, nick and role) */
export const useMyImage = (): string => {
	const user = useReactiveVar(userVar);
	const { data } = useQuery<{ getMember: Member }>(GET_MEMBER, {
		variables: { input: user._id },
		skip: !user._id,
		fetchPolicy: 'cache-first',
	});
	return data?.getMember.memberImage ?? '';
};
