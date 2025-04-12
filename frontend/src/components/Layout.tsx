import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="container">
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};
