import "./App.css"; // Zentra Theme
import { Hero } from "./components/ui/animated-hero";
import { NavBar } from "./components/ui/tubelight-navbar";
import { Home, Info, HelpCircle } from "lucide-react";

function App() {
  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "About", url: "#about", icon: Info },
    { name: "FAQ", url: "#faq", icon: HelpCircle },
  ];

  return (
    <>
      <NavBar items={navItems} />
      <Hero />
    </>
  );
}

export default App;
