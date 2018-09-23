import React, { Component } from 'react';
import { Route, Router } from 'react-router-dom';
import Login from './components/Login';
import Muziq from './components/Muziq'
import history from './History'
// import createBrowserHistory from 'history/createBrowserHistory'

// const history = createBrowserHistory()

class Routers extends Component {
    render() {
        return (
            <Router history={history}>
                <div>
                    <Route path="/login" component={Login} />
                    <Route exact path="/" component={Muziq} />
                </div>
            </Router>
        )
    }
}

export default Routers;