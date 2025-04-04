import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { FormData } from "../types/types";
import { toast } from "react-toastify";

const Registration = () => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    address: "",
    meterNumber: "", // Use default values matching the type
    phoneNumber: "",
    complaintDetails: "",
  });

  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 5000);
  }, []);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setLoaded(false);
      }, 5000);
    }
  }, [loaded]);

  async function submitComplaints(e: any) {
    e.preventDefault();
    console.log(formData);
    setLoading(true);

    try {
      const response = await fetch(
        "https://phed-complaints.onrender.com/api/v1/complaints/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "All fields are required!") {
          toast.warn(data.message);
        }
        toast.error(data.message);
      }

      if (response.ok) {
        setFormData({
          fullName: "",
          address: "",
          meterNumber: "",
          phoneNumber: "",
          complaintDetails: "",
        });
        toast.success(data.message);
      }
    } catch (error: any) {
      toast.error("Please check your internet connection and try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="glow"></div>
      <div className="registration-form card">
        <div className="form-header">
          <h2>PHED Complaint Registration</h2>
          <p>Create your account to submit complaints</p>
        </div>

        <form onSubmit={submitComplaints}>
          <div className="form-group">
            <label className="label" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="inputField"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="address">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="inputField"
              placeholder="Enter Address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="meter-number">
              Meter Number
            </label>
            <input
              type="number"
              id="meter-number"
              className="inputField"
              placeholder="e.g: 0123456789..."
              value={formData.meterNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meterNumber: e.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="number"
              id="phone"
              className="inputField"
              placeholder="e.g: 08121061727..."
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="complain">
              Complain
            </label>
            <textarea
              id="complain"
              className="inputField"
              placeholder="Add your complain..."
              value={formData.complaintDetails}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  complaintDetails: e.target.value,
                }))
              }
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={loading}
          >
            {loading ? "sending..." : "Register Complain"}
          </button>
        </form>
      </div>
      <div
        className="live-chat-btn"
        onClick={() => navigate("/chat")}
        onMouseEnter={() => setLoaded(true)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z"
            stroke="#FFD700"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M8 10H16"
            stroke="#0056B3"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M8 14H12"
            stroke="#0056B3"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <p
          style={{
            display: loaded ? "block" : "none",
          }}
        >
          Chat with a staff ?
        </p>
      </div>
    </div>
  );
};

export default Registration;
