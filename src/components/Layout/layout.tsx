import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Header />
            <div>
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;