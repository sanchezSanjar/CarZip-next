import { JwtPayload } from 'jwt-decode';

// what the backend puts in the access token (nothing private: a JWT can be read by anyone)
export interface CustomJwtPayload extends JwtPayload {
	_id: string;
	memberNick: string;
	memberType: string;
	memberStatus: string;
}
