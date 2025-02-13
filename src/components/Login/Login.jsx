import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { auth, provider,db } from "../firebase"; 
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputs = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordVisibilityToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    let toastId = toast.loading("Logging in, please wait....", {
      position: "top-center",
    });

    try {
      const loggedInUser = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      if (loggedInUser) {
        toast.update(toastId, {
          render: "Logged in successful!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        navigate("/home");
        //console.log("Email Login Successful:", loggedInUser);
      } else {
        toast.update(toastId, {
          render: "Something went wrong",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: `Login failed: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleGoogleLogin = async () => {
    let toastId = toast.loading("Signing in with Google...", {
      position: "top-center",
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
          });
        }

        toast.update(toastId, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        navigate("/home");
      }
    } catch (error) {
      toast.update(toastId, {
        render: `Google Sign-In Failed: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });

      console.error("Google Login Error:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="login-container">
        <h2 className="heading">WELCOME BACK</h2>
        <form onSubmit={handleEmailLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              autoComplete="off"
              onChange={handleInputs}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={user.password}
                autoComplete="off"
                onChange={handleInputs}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="eye-icon"
                onClick={handlePasswordVisibilityToggle}
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>

        <hr />
        <p>or continue with</p>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://img.icons8.com/color/48/google-logo.png"
            alt="Google Logo"
          />
          Sign in with Google
        </button>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
