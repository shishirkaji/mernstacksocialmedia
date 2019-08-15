import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Alert from "./components/layout/Alert";
import PrivateRoute from './components/Routing/PrivateRoute';
import Dashboard from './components/Dashboard/Dashboard';
// import {setAuthToken} from './util/setAuthToken'
//redux
import { store } from "./store";
import { Provider } from "react-redux";
import setAuthToken from "./util/setAuthToken";
import { loadUser } from "./action/auth";
if (localStorage.token) {
  setAuthToken(localStorage.token);
} 
const App = () => {
  useEffect(() => {
    store.dispatch(loadUser()
  )  
  },[])
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <section className="container">
            <Alert />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />

            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};
export default App;
