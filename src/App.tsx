import React from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import "./App.css";
import RouterScreen from "./screens/RouterScreen";

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <RouterScreen />
      </div>
    </Provider>
  );
}

export default App;
