import React from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_CAR } from '../../../apollo/user/query';
import { CarStatus } from '../../enums/car.enum';
import { Car } from '../../types/car/car';
import AddNewCar from './AddNewCar';

/** loads the dealer's car, then shows the list-a-car form filled with it. Sold cars are final */
const EditCar = ({ carId }: { carId: string }) => {
	const user = useReactiveVar(userVar);
	const { data, loading } = useQuery<{ getCar: Car }>(GET_CAR, { fetchPolicy: 'network-only', variables: { input: carId }, skip: !carId });
	const car = data?.getCar;

	if (loading) return <p className="muted">Loading the car…</p>;
	if (!car || car.memberId !== user._id || car.carStatus === CarStatus.SOLD) {
		return (
			<div className="empty">
				<h3>This car can&apos;t be edited</h3>
				<p>Only your own cars that are for sale or on hold can be changed.</p>
				<Link href="/mypage?category=myCars" className="btn ghost">
					Back to my cars
				</Link>
			</div>
		);
	}
	return <AddNewCar key={car._id} car={car} />;
};

export default EditCar;
