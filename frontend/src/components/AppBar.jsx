import { useNavigate } from "react-router-dom";

export const AppBar = ({ name }) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between py-5 px-10 h-15 bg-black sticky text-white">
      <div className="flex flex-col text-xl">PayTM App</div>
      <div className="flex flex-col justify-center h-full mr-4 text-xl">{name}</div>
      <div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          {" "}
          Logout
        </button>
      </div>
    </div>
  );
};