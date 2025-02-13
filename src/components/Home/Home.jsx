import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { toast } from "react-toastify";
import "./Home.css";
import { useNavigate } from "react-router-dom";


const API_KEY = import.meta.env.VITE_MAP_API_KEY;

const Home = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const mapRef = useRef(null);

  const navigate=useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "Users", currentUser.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const toastId = toast.info("Fetching location...", { autoClose: false });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          toast.update(toastId, {
            render: "Location fetched successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        },
        (error) => {
          toast.update(toastId, {
            render: "Error fetching location. Please enable location services.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          console.error("Error fetching location:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.warning("Geolocation is not supported by this browser.", {
        toastId: "geo-warning",
      });
    }
  }, []);

  const fetchNearbyHospitals = (lat, lng) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    const toastId = toast.info("Fetching nearby hospitals...", {
      autoClose: false,
    });

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 5000,
      type: "hospital",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setHospitals(results);
        toast.update(toastId, {
          render: `Found ${results.length} hospitals nearby!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: "Error fetching nearby hospitals. Try again later.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    });
  };

  useEffect(() => {
    if (location) {
      fetchNearbyHospitals(location.lat, location.lng);
    }
  }, [location]);

  const handleLogout=async()=>{
    try{
      await auth.signOut();
      toast.success("Logout successfully");
      navigate("/");
    }
    catch(error){
      console.log(error);
      }
  }

  return (
    <div className="map-main-container">
      <div className="home-container">
        {user ? (
          <h1 className="welcome-message">Welcome, {user.name}!</h1>
        ) : (
          <h1 className="welcome-message">Loading...</h1>
        )}
        <h5 className="disc">
          The nearest hospitals to you are shown on the map.
        </h5>

        <LoadScript googleMapsApiKey={API_KEY} libraries={["places"]}>
          {location ? (
            <GoogleMap
              center={location}
              zoom={14}
              mapContainerClassName="map"
              onLoad={(map) => {
                console.log("Google Map loaded");
                mapRef.current = map;
                fetchNearbyHospitals(location.lat, location.lng);
              }}
            >
              <Marker position={location} label="You" />
              {hospitals.map((hospital, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: hospital.geometry.location.lat(),
                    lng: hospital.geometry.location.lng(),
                  }}
                  // label={hospital.name}
                />
              ))}
            </GoogleMap>
          ) : (
            <p className="loading-message">Loading map...</p>
          )}
        </LoadScript>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
      </div>
    </div>
  );
};

export default Home;
