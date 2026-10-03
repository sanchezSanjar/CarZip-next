import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Menu, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import HeaderFilter from '../../libs/components/homepage/HeaderFilter';
import Filter from '../../libs/components/homepage/Filter';
import CarCard from '../../libs/components/common/CarCard';
import { GET_CARS } from '../../apollo/user/query';
import { useLikeCar } from '../../libs/hooks/useLikeCar';
import { sortOptions } from '../../libs/config';
import { Cars } from '../../libs/types/car/car';
import { CarsInquiry, CarsSearch } from '../../libs/types/car/car.input';
import { CarSort } from '../../libs/enums/car.enum';
import { Direction } from '../../libs/enums/common.enum';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { queryToSearch, searchToQuery } from '../../libs/carSearchQuery';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';

const PAGE_SIZE = 9;

/** drops empty values so the request only carries filters the user picked */
const cleanSearch = (search: CarsSearch): CarsSearch =>
	Object.fromEntries(
		Object.entries(search).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
	) as CarsSearch;

/** the search lives in the address (see libs/carSearchQuery), so reloading, Back and shared links keep it */
const CarList: NextPage = () => {
	const router = useRouter();
	const addressReady = useAddressReady();
	if (!addressReady) return null;
	const { search, sortIndex } = queryToSearch(router.query);
	const go = (next: CarsSearch, nextSort: number) =>
		router.push({ pathname: '/car', query: searchToQuery(cleanSearch(next), nextSort) }, undefined, { shallow: true, scroll: false }).then();
	return <CarSearch search={search} sortIndex={sortIndex} go={go} />;
};

interface CarSearchProps {
	search: CarsSearch;
	sortIndex: number;
	go: (search: CarsSearch, sortIndex: number) => void;
}

const CarSearch = ({ search, sortIndex, go }: CarSearchProps) => {
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const setSearch = (next: CarsSearch) => go(next, sortIndex);
	const setSortIndex = (i: number) => go(search, i);
	const [resetKey, setResetKey] = useState(0); // redraws the filter panels after "clear all"
	const [filtersOpen, setFiltersOpen] = useState(false); // phones: the filter panel opens on demand
	const likeCarHandler = useLikeCar();

	// a cursor belongs to its sort: changing the sort starts again from the first page
	const input: CarsInquiry = {
		limit: PAGE_SIZE,
		sort: sortOptions[sortIndex].sort as CarSort,
		direction: sortOptions[sortIndex].direction as Direction,
		search: cleanSearch(search),
	};
	const filtered = Object.keys(input.search ?? {}).length > 0;

	/** APOLLO REQUESTS **/
	const {
		loading: getCarsLoading,
		data: getCarsData,
		error: getCarsError,
		fetchMore,
	} = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const cars = getCarsData?.getCars.list ?? [];
	const nextCursor = getCarsData?.getCars.nextCursor;

	/** HANDLERS **/
	const clearAllHandler = () => {
		setSearch({});
		setResetKey(resetKey + 1);
	};

	const showMoreHandler = async () => {
		if (!nextCursor) return;
		setLoadingMore(true);
		try {
			await fetchMore({
				variables: { input: { ...input, cursor: nextCursor } },
				updateQuery: (prev, { fetchMoreResult }) => ({
					getCars: {
						...fetchMoreResult.getCars,
						list: [...(prev.getCars?.list ?? []), ...fetchMoreResult.getCars.list],
					},
				}),
			});
		} finally {
			setLoadingMore(false);
		}
	};

	return (
		<>
			<HeaderFilter key={`h${resetKey}`} search={search} setSearch={setSearch} />
			<div className="browse">
				<div className={`filter-wrap ${filtersOpen ? 'open' : ''}`}>
					<Filter key={`f${resetKey}`} search={search} setSearch={setSearch} />
					<button className="btn primary filter-done" onClick={() => setFiltersOpen(false)}>
						{t('search.showCars')}
					</button>
				</div>
				<main>
					<div className="results-head">
						<h2>{getCarsLoading && !cars.length ? t('search.loading') : t(nextCursor ? 'search.forSaleMore' : 'search.forSale', { count: cars.length })}</h2>
						<button className="btn ghost sm filter-toggle" onClick={() => setFiltersOpen(true)}>
							{t('search.filters')}{Object.keys(input.search ?? {}).length ? ` (${Object.keys(input.search ?? {}).length})` : ''}
						</button>
						<div className="sort">
							{t('search.sortBy')}
							<div className="field" role="button" style={{ cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
								{t(sortOptions[sortIndex].label)} <span>▾</span>
							</div>
							<Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
								{sortOptions.map((o, i) => (
									<MenuItem
										key={o.label}
										selected={i === sortIndex}
										onClick={() => {
											setSortIndex(i);
											setAnchorEl(null);
										}}
									>
										{t(o.label)}
									</MenuItem>
								))}
							</Menu>
						</div>
					</div>

					{getCarsError && (
						<div className="banner err" style={{ marginBottom: 20 }}>
							<span className="i">!</span>
							<div>
								<b>{t('search.loadError')}</b>
								{getCarsError.message}
							</div>
						</div>
					)}

					{getCarsLoading && !cars.length ? (
						<div className="grid3" aria-busy="true">
							{Array.from({ length: 6 }, (_, i) => (
								<div key={i} className="card skeleton-card">
									<div className="sk sk-photo" />
									<div className="sk sk-line" style={{ width: '72%' }} />
									<div className="sk sk-line" style={{ width: '45%' }} />
									<div className="sk sk-price" />
								</div>
							))}
						</div>
					) : !getCarsLoading && !getCarsError && !cars.length && filtered ? (
						<div className="empty">
							<h3>{t('search.noMatch')}</h3>
							<p>{t('search.noMatchText')}</p>
							<button className="btn dark" onClick={clearAllHandler}>
								{t('search.clearAll')}
							</button>
						</div>
					) : !getCarsLoading && !getCarsError && !cars.length ? (
						<div className="empty">
							<h3>{t('search.noCars')}</h3>
							<p>{t('search.noCarsText')}</p>
							<Link href="/account/join?mode=signup&type=AGENT" className="btn dark">
								{t('search.listYours')}
							</Link>
						</div>
					) : (
						<div className="grid3">
							{cars.map((car) => (
								<CarCard key={car._id} car={car} likeCarHandler={likeCarHandler} />
							))}
						</div>
					)}

					{nextCursor && (
						<div className="more">
							<button className="btn ghost" style={{ width: 260 }} onClick={showMoreHandler} disabled={loadingMore}>
								{loadingMore ? t('search.loadingMore') : t('search.showMore')}
							</button>
							{t('search.showing', { count: cars.length })}
						</div>
					)}
				</main>
			</div>
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(CarList, 'title.cars');
