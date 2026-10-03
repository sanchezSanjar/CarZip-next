import { CarBrand, CarColor, CarCondition, CarFuelType, CarLocation, CarMarket, CarOption, CarStatus, CarTransmission, CarType } from '../../enums/car.enum';
import { MeLiked } from '../like/like';
import { AgentPublic, TotalCounter } from '../member/member';

export interface Car {
	_id: string;
	carType: CarType;
	carStatus: CarStatus;
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
	carRentPrice?: number;
	carExportAgreedAt?: Date;
	carImages: string[];
	carDesc?: string;
	carOptions: CarOption[];
	carBarter: boolean;
	carRent: boolean;
	carTestDrive: boolean;
	carViews: number;
	carLikes: number;
	carComments: number;
	carRank: number;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	carHoldReason?: string;
	carConfirmedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	agentData?: AgentPublic;
	meLiked?: MeLiked[];
}

export interface Cars {
	list: Car[];
	nextCursor?: string;
}

export interface CarsPage {
	list: Car[];
	metaCounter?: TotalCounter[];
}

export interface CarCatalogBrand {
	brand: CarBrand;
	models: string[];
}
