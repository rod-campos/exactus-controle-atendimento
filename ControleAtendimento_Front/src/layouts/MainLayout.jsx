import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="w-full h-screen flex bg-gray-100 text-custom-gray font-quicksand">
      <Navbar />
      <div className="w-full h-full">{children}</div>
    </div>
  );
}

export default MainLayout;
