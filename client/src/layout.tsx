import "./globals.css";
import LoginPage from "./pages/login";
// import RegistrationPage from "./pages/registration";

const RootLayout: React.FC = () => {
  return (
    <html lang="en">
      <body>
        <LoginPage/>
      </body>
    </html>
  );
}

export default RootLayout
