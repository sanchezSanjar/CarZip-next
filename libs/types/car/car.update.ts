import { CarBrand, CarColor, CarCondition, CarFuelType, CarLocation, CarMarket, CarOption, CarStatus, CarTransmission, CarType } from '../../enums/car.enum';

export interface CarUpdate {
	_id: string;
	carStatus?: CarStatus;
	carType?: CarType;
	carBrand?: CarBrand;
	carModel?: string;
	carYear?: number;
	carMileage?: number;
	carColor?: CarColor;
	carCondition?: CarCondition;
	carFuelType?: CarFuelType;
	carTransmission?: CarTransmission;
	carLocation?: CarLocation;
	carAddress?: string;
	carTitle?: string;
	carMarket?: CarMarket;
	carPrice?: number;
	carPriceUsd?: number;
	exportAgreed?: boolean;
	carRent?: boolean;
	carRentPrice?: number;
	carBarter?: boolean;
	carTestDrive?: boolean;
	carImages?: string[];
	carDesc?: string;
	carOptions?: CarOption[];
}

export interface CarUpdateByAdmin {
	_id: string;
	carStatus: CarStatus;
	carHoldReason?: string;
}
