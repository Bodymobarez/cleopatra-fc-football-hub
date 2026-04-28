import Home from './pages/Home';
import Squad from './pages/Squad';
import Matches from './pages/Matches';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import GlobalNews from './pages/GlobalNews';
import Admin from './pages/Admin';
import Standings from './pages/Standings';
import About from './pages/About';
import Academy from './pages/Academy';
import FanZone from './pages/FanZone';
import Media from './pages/Media';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Squad": Squad,
    "Matches": Matches,
    "News": News,
    "NewsDetail": NewsDetail,
    "GlobalNews": GlobalNews,
    "Admin": Admin,
    "Standings": Standings,
    "About": About,
    "Academy": Academy,
    "FanZone": FanZone,
    "Media": Media,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};