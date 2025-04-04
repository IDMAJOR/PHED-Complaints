export default function UserNamePrompt({
  userName,
  setUserName,
  fullname,
}: any) {
  const handleSubmit = (event: any) => {
    event.preventDefault();

    fullname(userName);
  };
  return (
    <div className="username-prompt">
      <div className="card">
        <h2>Please Enter Your Name</h2>
        <p className="subtitle">
          We'll use this to personalize your experience
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your full name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              minLength={2}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!userName.trim()}
            className={!userName.trim() ? "disabled" : ""}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
