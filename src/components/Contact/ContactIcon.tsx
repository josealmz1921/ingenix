import {
  FaEnvelope, FaPhone, FaLocationDot, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaWhatsapp, FaXTwitter, FaYoutube, FaTiktok, FaGithub,
} from 'react-icons/fa6';
import type { ContactChannel } from '@/src/content/contact';

const icons = {
  email: FaEnvelope, phone: FaPhone, maps: FaLocationDot, whatsapp: FaWhatsapp,
  facebook: FaFacebookF, instagram: FaInstagram, linkedin: FaLinkedinIn,
  x: FaXTwitter, youtube: FaYoutube, tiktok: FaTiktok, github: FaGithub,
};

export default function ContactIcon({ channel }: { channel: ContactChannel }) {
  const Icon = icons[channel];
  return (
    <Icon aria-hidden="true" focusable="false" />
  );
}
