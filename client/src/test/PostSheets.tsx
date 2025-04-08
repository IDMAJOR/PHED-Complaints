import { useState } from "react";

type FormData = {
  Name: string;
  Address: string;
  Phone: string;
  Meter: string;
  Category: string;
  Nature: string;
  Source: string;
  Details: string;
};

function ComplaintForm() {
  const [formData, setFormData] = useState<FormData>({
    Name: "",
    Address: "",
    Phone: "",
    Meter: "",
    Category: "",
    Nature: "",
    Source: "",
    Details: "",
  });

  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formPayload = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      console.log(formPayload);

      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwzD6IlaVZLKKZ1porJeeyl3d2q4mzWr2JvCZmGCliJ3Fb1M5PtnYF6yvv96wuRT139eA/exec",
        {
          method: "POST",
          body: formPayload,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      const data = await res.json();
      setResponse(data);

      // Clear form on success
      setFormData({
        Name: "",
        Address: "",
        Phone: "",
        Meter: "",
        Category: "",
        Nature: "",
        Source: "",
        Details: "",
      });
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Complaint Form</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        {/* Column 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Full Name*</label>
            <input
              type="text"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Address*</label>
            <input
              type="text"
              value={formData.Address}
              onChange={(e) =>
                setFormData({ ...formData, Address: e.target.value })
              }
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Phone Number*</label>
            <input
              type="tel"
              value={formData.Phone}
              onChange={(e) =>
                setFormData({ ...formData, Phone: e.target.value })
              }
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div>
            <label>Meter Number</label>
            <input
              type="text"
              value={formData.Meter}
              onChange={(e) =>
                setFormData({ ...formData, Meter: e.target.value })
              }
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        {/* Column 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <label>Category*</label>
            <select
              value={formData.Category}
              onChange={(e) =>
                setFormData({ ...formData, Category: e.target.value })
              }
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Select Category</option>
              <option value="Billing">Billing</option>
              <option value="Service">Service</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Nature of Complaint*</label>
            <select
              value={formData.Nature}
              onChange={(e) =>
                setFormData({ ...formData, Nature: e.target.value })
              }
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Select Nature</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>

          <div>
            <label>Source*</label>
            <select
              value={formData.Source}
              onChange={(e) =>
                setFormData({ ...formData, Source: e.target.value })
              }
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Select Source</option>
              <option value="Phone">Phone</option>
              <option value="Email">Email</option>
              <option value="In-Person">In-Person</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <div>
            <label>Details*</label>
            <textarea
              value={formData.Details}
              onChange={(e) =>
                setFormData({ ...formData, Details: e.target.value })
              }
              required
              style={{ width: "100%", minHeight: "100px", padding: "8px" }}
            />
          </div>
        </div>

        {/* Submit Button - spans both columns */}
        <div style={{ gridColumn: "1 / -1" }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              background: isLoading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {isLoading ? "Submitting..." : "Submit Complaint"}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "20px",
            padding: "10px",
            background: "#ffeeee",
          }}
        >
          Error: {error}
        </div>
      )}

      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f8ff",
            borderRadius: "4px",
            borderLeft: "4px solid #007bff",
          }}
        >
          <h3>Submission Successful!</h3>
          <p>
            Your ticket ID: <strong>{response.ticketId}</strong>
          </p>
          <p>Submitted at: {new Date(response.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default ComplaintForm;
