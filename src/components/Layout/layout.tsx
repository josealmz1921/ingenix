import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { getHomeContent } from '@/src/server/homeContent';
import { getPublicContact, getPublicRecord } from '@/src/server/publicContent';
import { contactSectionAvailable } from '@/src/content/contact';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const [page, company, contact] = await Promise.all([
    getHomeContent(),
    getPublicRecord('empresa', 'profile'),
    getPublicContact(),
  ]);
  const navigation = page.sections
    .filter((section) => section.visible && section.navigationLabel)
    .map((section) => ({ label: section.navigationLabel!, href: `/#${section.id}` }));
  return (
    <div>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header navigation={navigation} contactAvailable={contactSectionAvailable(page)} />
      <div>
        {children}
      </div>
      <Footer navigation={navigation} companyAvailable={Boolean(company)} contact={contact} />
    </div>
  );
};

export default Layout;
