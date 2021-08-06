import { HashRouter as Router, Route } from "react-router-dom";
import Home from "@/pages/home/Home.jsx";
import "@/assets/style/normalize.css";
import "@/assets/iconfont/iconfont.css";
import "antd/dist/antd.less";

function App() {
  return (
    <Router>
      <Route path="/" component={Home}/>
    </Router>
  );
}

export default App;
