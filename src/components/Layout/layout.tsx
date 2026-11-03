import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { homeNavigation } from '@/src/content/home';
import { getPublishedHome } from '@/src/server/publishedHome';
import { getPublicRecord } from '@/src/server/publicContent';

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const [published, company] = await Promise.all([getPublishedHome(), getPublicRecord('empresa', 'profile')]);
    const navigation = published ? published.sections.filter(section => section.visible && section.navigationLabel).map(section => ({ label: section.navigationLabel!, href: `/#${section.id}` })) : homeNavigation;
    return (
        <div>
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <Header navigation={navigation} />
            <div>
                {children}
            </div>
            <Footer navigation={navigation} companyAvailable={Boolean(company)} />
        </div>
    )
}

export default Layout;
