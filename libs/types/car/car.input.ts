import { CarBrand, CarColor, CarCondition, CarFuelType, CarLocation, CarMarket, CarOption, CarSort, CarStatus, CarTransmission, CarType } from '../../enums/car.enum';
import { Direction } from '../../enums/common.enum';

export interface CarsInquiry {
	limit: number;
	sort?: CarSort;
	direction?: Direction;
	cursor?: string;
	search?: CarsSearch;
}

export interface CarsSearch {
	agentId?: string;
	brandList?: CarBrand[];
	modelList?: string[];
	typeList?: CarType[];
	colorList?: CarColor[];
	locationList?: CarLocation[];
	conditionList?: CarCondition[];
	fuelList?: CarFuelType[];
	transmissionList?: CarTransmission[];
	optionList?: CarOption[];
	market?: CarMarket;
	priceRange?: NumberRange;
	priceUsdRange?: NumberRange;
	mileageRange?: NumberRange;
	yearRange?: NumberRange;
	barter?: boolean;
	rent?: boolean;
	testDrive?: boolean;
	text?: string;
}

export interface NumberRange {
	start?: number;
	end?: number;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}

export interface AgentCarsInquiry {
	page: number;
	limit: number;
	sort?: CarSort;
	direction?: Direction;
	search?: ACSearch;
}

export interface ACSearch {
	carStatus?: CarStatus;
}

export interface AllCarsInquiry {
	page: number;
	limit: number;
	sort?: CarSort;
	direction?: Direction;
	search?: ALCSearch;
}

export interface ALCSearch {
	carStatus?: CarStatus;
	locationList?: CarLocation[];
	agentId?: string;
}

export interface CarInput {
	carType: CarType;
	carBrand: CarBrand;
	carModel: string;
	carYear: number;
	carMileage: number;
	carColor: CarColor;
	carCondition: CarCondition;
	carFuelType: CarFuelType;
	carTransmission: CarTransmission;
	carLocation: CarLocation;
	carAddress: string;
	carTitle: string;
	carMarket: CarMarket;
	carPrice?: number;
	carPriceUsd?: number;
	exportAgreed?: boolean;
	carRent: boolean;
	carRentPrice?: number;
	carBarter: boolean;
	carTestDrive: boolean;
	carImages: string[];
	carDesc?: string;
	carOptions?: CarOption[];
}
