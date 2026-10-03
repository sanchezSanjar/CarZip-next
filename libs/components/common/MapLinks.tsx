import React from 'react';
import { useTranslation } from 'next-i18next/pages';

/**
 * Open a place in Naver Map or Kakao Map (new window), searched by its address.
 * The marks only echo each brand's colour; they are not the official logo files.
 */
const MapLinks = ({ query, compact = false }: { query: string; compact?: boolean }) => {
	const { t } = useTranslation('common');
	const q = encodeURIComponent(query);
	return (
		<div className={`map-links ${compact ? 'compact' : ''}`}>
			<a className="map-link naver" href={`https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener noreferrer" title={t('map.openNaver')}>
				<span className="mark">N</span>
				{!compact && t('map.naver')}
			</a>
			<a className="map-link kakao" href={`https://map.kakao.com/?q=${q}`} target="_blank" rel="noopener noreferrer" title={t('map.openKakao')}>
				<span className="mark">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M12 2C7.6 2 4 5.4 4 9.6c0 5.5 8 12.4 8 12.4s8-6.9 8-12.4C20 5.4 16.4 2 12 2zm0 10.6a3 3 0 110-6 3 3 0 010 6z" />
					</svg>
				</span>
				{!compact && t('map.kakao')}
			</a>
		</div>
	);
};

export default MapLinks;
