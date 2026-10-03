import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="preload" href="/fonts/PretendardVariable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

				{/* SEO */}
				<meta name="keyword" content={'carzip, used cars korea, verified car dealers, 중고차, export cars'} />
				<meta
					name={'description'}
					content={
						'Used cars from verified dealers in South Korea. Buy in Korea or for export, book test drives and contact dealers directly. | ' +
						'검증된 딜러의 중고차를 CarZip에서 만나보세요.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
