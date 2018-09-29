import React, { Component } from 'react';
import { connect } from "react-redux";
import './Admin.css'
import { LogoutAction} from "../store/actions/actions";
class Muziq extends Component {
    constructor(props){
        super(props)
        this.handleHomeLink = this.handleHomeLink.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.handleLogin = this.handleLogin.bind(this)

    }
    handleLogout(e){
        e.preventDefault()
        this.props.Logout()
        this.props.history.push('/')
    }
    handleHomeLink(e){
        e.preventDefault()
    }
    handleLogin(e){
        e.preventDefault()
        this.props.history.push('/login')
    }

    render() {
        return(
            <div>
            <nav className="navbar navbar-inverse navbar-fixed-top">
              <div className="container-fluid">
                <div className="navbar-header">
                  <a onClick={this.handleHomeLink} className="navbar-brand"><h3 style={{display:'inline',fontSize:30}}>MuZ!Q</h3></a>
                </div>
                <ul className="nav navbar-nav navbar-right">
                  {(this.props.isLoggedIn) && <button onClick={this.handleLogout} className="btn btn-danger navbar-btn">LOG OUT</button>}
                  {(!this.props.isLoggedIn) && <button onClick={this.handleLogin} className="btn btn-info navbar-btn">LOGIN</button>}
                </ul>
              </div>
            </nav>
            <br/><br/><br/>
            </div>
        )
        // )
    }
}

function mapStateToProps(state){
    return({
        isLoggedIn:state.rootReducer.isLoggedIn,
        firstName:state.rootReducer.userName,
    })
}

function mapActionsToProps(dispatch){
    return({
        Logout:()=>{
            dispatch(LogoutAction())
        }
    })
}


export default connect(mapStateToProps,mapActionsToProps)(Muziq);
