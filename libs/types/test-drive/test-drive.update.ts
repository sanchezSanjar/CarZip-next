import { TestDriveStatus } from '../../enums/test-drive.enum';

export interface TestDriveUpdate {
	_id: string;
	testDriveStatus: TestDriveStatus;
}
