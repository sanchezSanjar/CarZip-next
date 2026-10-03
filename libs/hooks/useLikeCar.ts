import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import { useMutation, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_CAR } from '../../apollo/user/mutation';
import { getErrorMessage } from '../auth';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../sweetAlert';
import { MeLiked } from '../types/like/like';

const CAR_LIKED = gql`
	fragment CarLiked on Car {
		meLiked {
			memberId
			likeRefId
			myFavorite
		}
	}
`;

/**
 * Like / un-like a car (the API toggles). The new count comes back from the server;
 * the "I liked it" flag is flipped in the cache so every card showing this car updates at once.
 */
export const useLikeCar = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);

	return async (carId: string) => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to save cars to your favourites.')) await router.push('/account/join?mode=login');
			return;
		}
		try {
			await likeTargetCar({
				variables: { input: carId },
				update: (cache) => {
					const id = cache.identify({ __typename: 'Car', _id: carId });
					const current = cache.readFragment<{ meLiked: MeLiked[] | null }>({ id, fragment: CAR_LIKED });
					const liked = !!current?.meLiked?.[0]?.myFavorite;
					cache.writeFragment({
						id,
						fragment: CAR_LIKED,
						data: { meLiked: liked ? [] : [{ __typename: 'MeLiked', memberId: user._id, likeRefId: carId, myFavorite: true }] },
					});
				},
			});
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err)); // e.g. your own car, or the dealer blocked you
		}
	};
};
