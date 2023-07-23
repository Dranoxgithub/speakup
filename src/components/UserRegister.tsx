import React, { useState } from "react";
import { userSignupThunk, getUserState } from "../redux/userSlice";
import { useAppSelector, useAppDispatch } from "../hooks";

const UserRegister = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(getUserState);

  function handleRegister(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(event.target);

    dispatch(
      userSignupThunk({
        email: event.target.email.value,
        password: event.target.password.value,
      })
    );
  }

  return (
    <div>
      <div className="container">
        <div>
          <form
            onSubmit={handleRegister}
            id="signupForm"
            action="https://listenup-backend.tichx1.repl.co/api/signup_rn"
            method="POST"
          >
            Email: <input type="email" name="email" />
            <br />
            Password: <input type="password" name="password" />
            <input type="submit" />
          </form>
          <p>Your email in state~~: {user.email}</p>
          <p>Your email in state: {user.idToken}</p>
          <p>Your email in state: {user.refreshToken}</p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
