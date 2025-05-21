
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 md:container pt-6 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
