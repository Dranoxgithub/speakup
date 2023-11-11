import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "bootstrap/dist/css/bootstrap.css";
import "./mobile-styles.css"
import "./desktop-styles.css";
import "./App.css";
import RouterScreen from "./screens/RouterScreen";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <RouterScreen />
      </div>
    </Provider>
  );
}

export default App;
