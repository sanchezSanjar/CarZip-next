import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const emptyUser: CustomJwtPayload = {
	_id: '',
	memberNick: '',
	memberType: '',
	memberStatus: '',
};

// the logged-in member, filled from the access token
export const userVar = makeVar<CustomJwtPayload>(emptyUser);
