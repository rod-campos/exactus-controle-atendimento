function UserLayout({ children }) {
  return (
    <div className="flex flex-col w-full h-screen p-5 bg-gray-100 text-custom-gray font-quicksand">
      {children}
    </div>
  );
}

export default UserLayout;
