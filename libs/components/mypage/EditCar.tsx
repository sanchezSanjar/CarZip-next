import React from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_CAR } from '../../../apollo/user/query';
import { CarStatus } from '../../enums/car.enum';
import { Car } from '../../types/car/car';
import AddNewCar from './AddNewCar';
import { useTranslation } from 'next-i18next/pages';

/** loads the dealer's car, then shows the list-a-car form filled with it. Sold cars are final */
const EditCar = ({ carId }: { carId: string }) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const { data, loading } = useQuery<{ getCar: Car }>(GET_CAR, { fetchPolicy: 'network-only', variables: { input: carId }, skip: !carId });
	const car = data?.getCar;

	if (loading) return <p className="muted">{t('ec.loading')}</p>;
	if (!car || car.memberId !== user._id || car.carStatus === CarStatus.SOLD) {
		return (
			<div className="empty">
				<h3>{t('ec.cant')}</h3>
				<p>{t('ec.cantText')}</p>
				<Link href="/mypage?category=myCars" className="btn ghost">
					{t('ec.back')}
				</Link>
			</div>
		);
	}
	return <AddNewCar key={car._id} car={car} />;
};

export default EditCar;
