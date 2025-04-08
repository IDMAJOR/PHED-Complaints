import { JSX } from "react";

type LoadingBarProps = {
  percent: any;
};

const LoadingBar = ({ percent }: LoadingBarProps): JSX.Element => {
  return (
    <div
      className="ver-btn"
      style={{
        width: 150,
        height: 40,
        backgroundColor: "#ddd",
        borderRadius: "15px",
        overflow: "hidden",
        padding: 0,
      }}
    >
      <p
        style={{
          color: "gray",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
        }}
      >
        {Math.floor(percent)}%
      </p>
      <div
        style={{
          width: `${percent}%`,
          height: "100%",
          backgroundColor: "#007bff",
          transition: "width 0.3s ease",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </div>
  );
};

export default LoadingBar;
