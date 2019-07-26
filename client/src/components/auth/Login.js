import React, { Fragment, useState } from 'react';
import {Link} from 'react-router-dom';
import {connect } from 'react-redux';
import PropTypes from 'prop-types';
import {login } from '../../action/auth'
// import PropTypes from 'prop-types'

const Login = ({login}) => {

    const [formData , setFormData] = useState({
        email:'',
        password :''
    });

    const {email , password } = formData;
    const onChange = e =>{
        setFormData({...formData , [e.target.name] : e.target.value});
    }
    const onSubmit = e=>{
        e.preventDefault();
        login(email, password);
    }
  return (
    <Fragment>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead">
        <i className="fas fa-user" /> Sign into Your Account
      </p>
      <form className="form" onSubmit={e => onSubmit(e)}>
        <div className="form-group">
          <input
            // type="email"
            placeholder="Email Address"
            name="email"
            // required
            value={email}
            onChange={e => onChange(e)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            // required
            onChange={e => onChange(e)}
            // minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Log in" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/register">Sign In</Link>
      </p>
    </Fragment>
  );
};
Login.prototype = {
  login : PropTypes.func.isRequired,
}
export default connect(null , {login})(Login) ;
