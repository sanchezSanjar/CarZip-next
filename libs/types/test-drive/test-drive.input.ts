import { Direction } from '../../enums/common.enum';
import { TestDriveStatus } from '../../enums/test-drive.enum';

export interface TestDrivesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: TDISearch;
}

export interface TDISearch {
	testDriveStatus?: TestDriveStatus;
}

export interface TestDriveInput {
	carId: string;
	testDriveDate: Date;
	testDriveMessage?: string;
}
