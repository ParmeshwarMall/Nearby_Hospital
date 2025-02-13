import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./components/firebase";

const App = () => {

  const [user,setUser]=useState();
  useEffect(()=>{
    auth.onAuthStateChanged(user=>{
      setUser(user);
    })
  })

  return (
    <Router>
      <div>
        <ToastContainer theme="colored" />
        <Routes>
          <Route path="/" element={user? <Navigate to="/home"/>:<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={user?<Home />:<Navigate to="/"/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
