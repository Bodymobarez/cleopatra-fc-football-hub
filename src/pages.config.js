import Home from './pages/Home';
import Squad from './pages/Squad';
import Matches from './pages/Matches';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import GlobalNews from './pages/GlobalNews';
import Admin from './pages/Admin';
import AdminPanel from './pages/AdminPanel';
import Standings from './pages/Standings';
import About from './pages/About';
import Academy from './pages/Academy';
import FanZone from './pages/FanZone';
import Media from './pages/Media';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Squad": Squad,
    "Matches": Matches,
    "MatchCenter": Matches,       // alias → Matches
    "News": News,
    "NewsDetail": NewsDetail,
    "GlobalNews": GlobalNews,
    "LeagueNews": GlobalNews,     // alias → GlobalNews
    "Admin": Admin,
    "AdminPanel": AdminPanel,
    "Standings": Standings,
    "About": About,
    "Academy": Academy,
    "FanZone": FanZone,
    "Media": Media,
    "Login": Login,
    "Register": Register,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};