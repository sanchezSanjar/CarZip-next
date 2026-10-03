import { CarBrand, CarStatus } from '../../enums/car.enum';
import { TestDriveStatus } from '../../enums/test-drive.enum';
import { AgentPublic, TotalCounter } from '../member/member';

export interface TestDriveCar {
	_id: string;
	carTitle: string;
	carBrand: CarBrand;
	carModel: string;
	carYear: number;
	carStatus: CarStatus;
	carImages: string[];
}

export interface TestDriveBuyer {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberPhone?: string;
}

export interface TestDrive {
	_id: string;
	testDriveStatus: TestDriveStatus;
	testDriveDate: Date;
	testDriveMessage?: string;
	carId: string;
	memberId: string;
	sellerId: string;
	createdAt: Date;
	updatedAt: Date;
	carData?: TestDriveCar;
	sellerData?: AgentPublic;
	buyerData?: TestDriveBuyer;
}

export interface TestDrives {
	list: TestDrive[];
	metaCounter?: TotalCounter[];
}
