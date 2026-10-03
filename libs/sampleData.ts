/**
 * Sample data from the UI design, shaped like the API types.
 * Screens show it until each one is connected to the API.
 */
import {
	CarBrand,
	CarColor,
	CarCondition,
	CarFuelType,
	CarLocation,
	CarMarket,
	CarOption,
	CarStatus,
	CarTransmission,
	CarType,
} from './enums/car.enum';
import { BoardArticleCategory } from './enums/board-article.enum';
import { Car } from './types/car/car';
import { AgentPublic, Member } from './types/member/member';
import { BoardArticle } from './types/board-article/board-article';
import { MemberStatus, MemberType } from './enums/member.enum';

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

export const sampleDealers: AgentPublic[] = [
	{ _id: 'd1', memberNick: 'mokdongmotors', agentCompany: 'Mokdong Motors', memberRank: 1, contactPhone: '010-2345-6789', contactEmail: 'sales@mokdongmotors.kr', contactTelegram: '@mokdongmotors', contactWhatsapp: '+82 10 2345 6789', contactKakao: 'mokdongmotors' },
	{ _id: 'd2', memberNick: 'gangnampremium', agentCompany: 'Gangnam Premium', memberRank: 2, contactPhone: '010-3456-7890' },
	{ _id: 'd3', memberNick: 'haeundaecars', agentCompany: 'Haeundae Cars', memberRank: 3, contactPhone: '010-4567-8901' },
	{ _id: 'd4', memberNick: 'songdoauto', agentCompany: 'Songdo Auto', memberRank: 4, contactPhone: '010-5678-9012' },
	{ _id: 'd5', memberNick: 'yuseongauto', agentCompany: 'Yuseong Auto', memberRank: 5, contactPhone: '010-6789-0123' },
	{ _id: 'd6', memberNick: 'jejurent', agentCompany: 'Jeju Island Rent', memberRank: 6, contactPhone: '010-7890-1234' },
	{ _id: 'd7', memberNick: 'suseongmotors', agentCompany: 'Suseong Motors', memberRank: 7 },
	{ _id: 'd8', memberNick: 'sangmucars', agentCompany: 'Sangmu Cars', memberRank: 8 },
];

const [mokdong, gangnam, haeundae, songdo, yuseong, , suseong, sangmu] = sampleDealers;

const car = (c: Partial<Car> & Pick<Car, '_id' | 'carTitle' | 'carBrand' | 'carModel'>): Car => ({
	carType: CarType.SEDAN,
	carStatus: CarStatus.ACTIVE,
	carYear: 2021,
	carMileage: 50000,
	carColor: CarColor.WHITE,
	carCondition: CarCondition.EXCELLENT,
	carFuelType: CarFuelType.GASOLINE,
	carTransmission: CarTransmission.AUTOMATIC,
	carLocation: CarLocation.SEOUL,
	carAddress: 'Mokdong-ro 201, Yangcheon-gu',
	carMarket: CarMarket.DOMESTIC,
	carImages: [],
	carOptions: [],
	carBarter: false,
	carRent: false,
	carTestDrive: false,
	carViews: 0,
	carLikes: 0,
	carComments: 0,
	carRank: 0,
	memberId: 'd1',
	createdAt: daysAgo(3),
	updatedAt: daysAgo(3),
	...c,
});

export const sampleCars: Car[] = [
	car({ _id: 'c1', carTitle: 'Kia Sorento 2.2 Diesel', carBrand: CarBrand.KIA, carModel: 'Sorento', carType: CarType.SUV, carYear: 2021, carMileage: 48200, carFuelType: CarFuelType.DIESEL, carMarket: CarMarket.BOTH, carPrice: 31500000, carPriceUsd: 22800, carRent: true, carRentPrice: 89000, carTestDrive: true, carLikes: 64, carViews: 1204, carComments: 5, agentData: mokdong, carAddress: 'Yangcheon-gu',
		carOptions: [CarOption.PANORAMIC_SUNROOF, CarOption.NAVIGATION, CarOption.AROUND_VIEW, CarOption.HEATED_SEATS, CarOption.VENTILATED_SEATS, CarOption.SMART_KEY, CarOption.ADAPTIVE_CRUISE, CarOption.BLACK_BOX],
		carDesc: 'One owner, all services done at Kia dealerships with records available. No accidents, no flood history. Tyres replaced in May 2026. The car can be seen at our lot in Mokdong on weekdays 10:00 to 19:00 and Saturday mornings.' }),
	car({ _id: 'c2', carTitle: 'Hyundai Grandeur 2.5', carBrand: CarBrand.HYUNDAI, carModel: 'Grandeur', carYear: 2020, carMileage: 62000, carColor: CarColor.BLACK, carLocation: CarLocation.INCHEON, carPrice: 22800000, carTestDrive: true, carLikes: 41, memberId: 'd4', agentData: songdo }),
	car({ _id: 'c3', carTitle: 'Genesis GV70 2.5T', carBrand: CarBrand.GENESIS, carModel: 'GV70', carType: CarType.SUV, carYear: 2022, carMileage: 31500, carColor: CarColor.BLUE, carMarket: CarMarket.EXPORT, carPriceUsd: 33500, carTestDrive: true, carBarter: true, carLikes: 128, memberId: 'd2', agentData: gangnam }),
	car({ _id: 'c4', carTitle: 'BMW 520d', carBrand: CarBrand.BMW, carModel: '5 Series', carYear: 2019, carMileage: 78900, carColor: CarColor.SILVER, carFuelType: CarFuelType.DIESEL, carLocation: CarLocation.BUSAN, carMarket: CarMarket.BOTH, carPrice: 29500000, carPriceUsd: 21300, carBarter: true, carLikes: 57, memberId: 'd3', agentData: haeundae }),
	car({ _id: 'c5', carTitle: 'Tesla Model 3', carBrand: CarBrand.TESLA, carModel: 'Model 3', carYear: 2023, carMileage: 18300, carColor: CarColor.RED, carFuelType: CarFuelType.ELECTRIC, carPrice: 38900000, carTestDrive: true, carLikes: 203, carViews: 3418, agentData: mokdong }),
	car({ _id: 'c6', carTitle: 'Kia Morning 1.0', carBrand: CarBrand.KIA, carModel: 'Morning', carType: CarType.HATCHBACK, carYear: 2018, carMileage: 71000, carColor: CarColor.GREEN, carLocation: CarLocation.DAEGU, carPrice: 6900000, carRent: true, carRentPrice: 39000, carLikes: 18, memberId: 'd7', agentData: suseong }),
	car({ _id: 'c7', carTitle: 'Hyundai Tucson 1.6T', carBrand: CarBrand.HYUNDAI, carModel: 'Tucson', carType: CarType.SUV, carYear: 2021, carMileage: 42600, carColor: CarColor.GRAY, carFuelType: CarFuelType.HYBRID, carLocation: CarLocation.DAEJON, carMarket: CarMarket.EXPORT, carPriceUsd: 20900, carTestDrive: true, carLikes: 73, memberId: 'd5', agentData: yuseong }),
	car({ _id: 'c8', carTitle: 'Mercedes E300', carBrand: CarBrand.MERCEDES, carModel: 'E-Class', carYear: 2020, carMileage: 55400, carColor: CarColor.BLACK, carMarket: CarMarket.BOTH, carPrice: 39800000, carPriceUsd: 28900, carTestDrive: true, carBarter: true, carLikes: 96, memberId: 'd2', agentData: gangnam }),
	car({ _id: 'c9', carTitle: 'Kia Ray 1.0', carBrand: CarBrand.KIA, carModel: 'Ray', carType: CarType.HATCHBACK, carYear: 2022, carMileage: 24100, carColor: CarColor.BEIGE, carLocation: CarLocation.GWANGJU, carPrice: 12900000, carLikes: 35, memberId: 'd8', agentData: sangmu }),
];

export const sampleAgents: Member[] = sampleDealers.slice(0, 6).map((d, i) => ({
	_id: d._id,
	memberType: MemberType.AGENT,
	memberStatus: MemberStatus.ACTIVE,
	memberAuthType: 'PHONE' as Member['memberAuthType'],
	memberNick: d.memberNick,
	memberImage: '',
	agentCompany: d.agentCompany,
	memberAddress: ['Seoul', 'Seoul', 'Busan', 'Incheon', 'Daejon', 'Jeju'][i],
	memberCars: [42, 57, 33, 28, 19, 24][i],
	memberFollowers: [318, 902, 271, 144, 96, 188][i],
	memberFollowings: 12,
	memberArticles: 6,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberComments: 0,
	memberRank: i + 1,
	contactPhone: d.contactPhone,
	createdAt: new Date('2026-03-01'),
	updatedAt: new Date('2026-03-01'),
}));

const article = (a: Partial<BoardArticle> & Pick<BoardArticle, '_id' | 'articleTitle' | 'articleCategory'>): BoardArticle => ({
	articleStatus: 'ACTIVE' as BoardArticle['articleStatus'],
	articleContent: '',
	articleViews: 0,
	articleLikes: 0,
	articleComments: 0,
	memberId: 'd1',
	createdAt: hoursAgo(2),
	updatedAt: hoursAgo(2),
	memberData: mokdong,
	...a,
});

export const sampleArticles: BoardArticle[] = [
	article({ _id: 'a1', articleCategory: BoardArticleCategory.RECOMMEND, articleTitle: 'What to check before buying a used diesel SUV', articleContent: 'DPF, timing chain noise on a cold start and the inspection record: three things that matter more than paint.', articleViews: 842, articleLikes: 31, articleComments: 9 }),
	article({ _id: 'a2', articleCategory: BoardArticleCategory.NEWS, articleTitle: 'Used EV prices in Seoul dropped again in September', articleContent: 'Model 3 and Ioniq 5 listings are down about 6% since July. Here is what we see on the lot.', articleViews: 1310, articleLikes: 58, articleComments: 22, memberId: 'd2', memberData: gangnam, createdAt: hoursAgo(5) }),
	article({ _id: 'a3', articleCategory: BoardArticleCategory.FREE, articleTitle: 'Is 90,000 km too much for a 2019 Grandeur?', articleContent: 'Buyer here. Found one I like but the mileage worries me. Opinions from dealers welcome.', articleViews: 604, articleLikes: 12, articleComments: 17, memberId: 'u1', memberData: { _id: 'u1', memberNick: 'hyejin_k', memberRank: 0 }, createdAt: daysAgo(1) }),
	article({ _id: 'a4', articleCategory: BoardArticleCategory.RECOMMEND, articleTitle: 'Five family SUVs under 3,000만원 that hold their value', articleContent: 'Sorento, Tucson, Santa Fe and two you might not expect.', articleViews: 2240, articleLikes: 140, articleComments: 36, memberId: 'd5', memberData: yuseong, createdAt: daysAgo(2) }),
	article({ _id: 'a5', articleCategory: BoardArticleCategory.HUMOR, articleTitle: 'Things customers find in the glovebox', articleContent: 'A cassette tape, three parking tickets and a very old kimbap.', articleViews: 2204, articleLikes: 158, articleComments: 40, createdAt: daysAgo(3) }),
	article({ _id: 'a6', articleCategory: BoardArticleCategory.NEWS, articleTitle: 'New inspection record rules from October', articleContent: 'What changes for buyers when reading 성능점검기록부.', articleViews: 980, articleLikes: 44, articleComments: 11, memberId: 'd4', memberData: songdo, createdAt: daysAgo(4) }),
];

export const sampleComments = [
	{ _id: 'm1', nick: 'hyejin_k', dealer: false, when: daysAgo(2), text: 'Is the sunroof original or aftermarket? And is the powertrain warranty still valid?' },
	{ _id: 'm2', nick: 'Mokdong Motors', dealer: true, when: daysAgo(2), text: 'Factory panoramic sunroof. Manufacturer warranty runs until March 2027, we can show the paperwork at the viewing.' },
	{ _id: 'm3', nick: 'Gangnam Premium', dealer: true, when: daysAgo(1), text: 'Nice spec for this mileage. Price looks fair for the market right now.' },
];
