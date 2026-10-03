import React from 'react';
import { AgentPublic } from '../../types/member/member';
import { sweetTopSuccessAlert } from '../../sweetAlert';

/** the dealer's public contacts: buyers reach the dealer outside CarZip */
const ContactList = ({ dealer, bar = false }: { dealer?: AgentPublic; bar?: boolean }) => {
	if (!dealer) return null;
	const kakao = dealer.contactKakao;
	const telegram = dealer.contactTelegram;
	const whatsapp = dealer.contactWhatsapp;
	const email = dealer.contactEmail;

	return (
		<div className={bar ? 'cbar' : 'contacts'}>
			{dealer.contactPhone && (
				<a className="contact call" href={`tel:${dealer.contactPhone}`}>
					<span className="ic" style={{ background: 'var(--signal)', color: 'var(--asphalt)' }}>
						☎
					</span>
					<b>Call</b>
					<span className="v num">{dealer.contactPhone}</span>
				</a>
			)}
			{kakao && (
				// KakaoTalk has no web link to a chat by ID, so the button copies the ID to paste in the app
				<button
					type="button"
					className="contact"
					title="Copy KakaoTalk ID"
					onClick={async () => {
						await navigator.clipboard.writeText(kakao);
						await sweetTopSuccessAlert(`KakaoTalk ID "${kakao}" copied`, 1500);
					}}
				>
					<span className="ic" style={{ background: '#FEE500' }}>
						K
					</span>
					KakaoTalk{!bar && <span className="v">{kakao}</span>}
				</button>
			)}
			{telegram && (
				<a className="contact" href={`https://t.me/${telegram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
					<span className="ic" style={{ background: '#229ED9', color: '#fff' }}>
						T
					</span>
					Telegram{!bar && <span className="v">{telegram}</span>}
				</a>
			)}
			{whatsapp && (
				<a className="contact" href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
					<span className="ic" style={{ background: '#25D366', color: '#fff' }}>
						W
					</span>
					WhatsApp{!bar && <span className="v num">{whatsapp}</span>}
				</a>
			)}
			{email && (
				<a className="contact" href={`mailto:${email}`} style={{ color: 'inherit' }}>
					<span className="ic" style={{ background: 'var(--line)' }}>
						@
					</span>
					Email{!bar && <span className="v">{email}</span>}
				</a>
			)}
		</div>
	);
};

export default ContactList;
