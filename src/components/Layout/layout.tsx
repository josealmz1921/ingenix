import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { homeNavigation } from '@/src/content/home';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <a className="skip-link" href="#contenido">Saltar al contenido</a>
            <Header navigation={homeNavigation} />
            <div>
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;
