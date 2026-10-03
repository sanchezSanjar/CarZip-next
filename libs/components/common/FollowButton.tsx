import React from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { Member } from '../../types/member/member';
import { getErrorMessage } from '../../auth';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface FollowButtonProps {
	dealerId: string;
	className?: string;
}

/** follow / unfollow a dealer. Only dealers can be followed, never yourself; guests are asked to log in */
const FollowButton = ({ dealerId, className = 'btn ghost sm' }: FollowButtonProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	// getMember tells a logged-in viewer whether they already follow (meFollowed)
	const { data } = useQuery<{ getMember: Member }>(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: dealerId },
		skip: !dealerId,
	});
	const [subscribe, { loading: subscribing }] = useMutation(SUBSCRIBE, { refetchQueries: [GET_MEMBER] });
	const [unsubscribe, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE, { refetchQueries: [GET_MEMBER] });
	const following = !!data?.getMember.meFollowed?.[0]?.myFollowing;

	if (dealerId === user._id) return null;

	/** HANDLERS **/
	const toggle = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to follow dealers and see their new cars first.')) await router.push('/account/join?mode=login');
			return;
		}
		try {
			if (following) await unsubscribe({ variables: { input: dealerId } });
			else await subscribe({ variables: { input: dealerId } });
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err)); // e.g. blocked by this dealer
		}
	};

	return (
		<button className={following ? 'btn ghost sm' : className} onClick={toggle} disabled={subscribing || unsubscribing}>
			{following ? '✓ Following' : 'Follow'}
		</button>
	);
};

export default FollowButton;
