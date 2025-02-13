import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { auth,db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate,Link } from "react-router-dom";
import { toast } from "react-toastify";
import {doc,setDoc} from "firebase/firestore"

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleInputs = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePasswordVisibilityToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  const submit = async (e) => {
    e.preventDefault();
    let toastId = toast.loading("Registering, please wait....", {
      position: "top-center",
    });

    try {
      const newUser = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      if(newUser.user)
      {
        await setDoc(doc(db,"Users",newUser.user.uid),{
          name:user.name,
          email:user.email,

        })
      }

      toast.update(toastId, {
        render: "Registration successful!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      navigate("/");
      //console.log("User Registered:", newUser);
    } catch (error) {
      toast.update(toastId, {
        render: `Registration failed: ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="main-container">
      <div className="login-container">
        <h2 className="heading">Create an Account</h2>
        <form onSubmit={submit}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              autoComplete="off"
              onChange={handleInputs}
              required
              placeholder="Enter your name"
            />
          </div>

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

          <button type="submit" className="btn">Register</button>
        </form>
        <p className="register-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
