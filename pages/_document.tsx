import Document, { Html, Head, Main, NextScript } from 'next/document';
import { htmlLang } from '../libs/languages';

export default class MyDocument extends Document {
	render() {
		return (
			<Html lang={htmlLang(this.props.locale)}>
				<Head>
					<meta name="robots" content="index,follow" />
					<link rel="icon" href="/favicon.ico" sizes="48x48" />
					<link rel="icon" href="/icon.svg" type="image/svg+xml" />
					<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
					<meta name="theme-color" content="#1E242B" />
					<link
						rel="preload"
						href="/fonts/PretendardVariable.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>

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
}
