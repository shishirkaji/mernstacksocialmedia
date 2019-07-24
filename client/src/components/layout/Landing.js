import React from 'react'
import PropTypes from 'prop-types'
import {Link } from 'react-router-dom';

const Landing = props => {
    return (
        <div>     
            <div className = "landing">
            <div className="dark-overlay">
        
        <div className="landing-inner">
          <h1 class="x-large">Developer Connector</h1>
          <p class="lead">
            Create a developer profile/portfolio, share posts and get help from
            other developers
          </p>
          <div className="buttons">
            <Link to="/register" class="btn btn-primary">Sign Up</Link>
            <Link to ="/login" class="btn btn-light">Login</Link>
          </div>
        </div>
      </div>
      </div>
        // </div>
    )
}

Landing.propTypes = {

}

export default Landing
