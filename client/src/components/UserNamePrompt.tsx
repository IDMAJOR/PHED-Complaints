type inProps = {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  fullname: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UserNamePrompt({
  userName,
  setUserName,
  fullname,
}: any) {
  return (
    <div className="username-prompt">
      <h2>Please Enter Your Name</h2>
      <form>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <button type="submit" onClick={() => fullname(true)}>
          Continue
        </button>
      </form>
    </div>
  );
}
