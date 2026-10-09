import { useNavigate } from "react-router-dom";
import DisasterForm from "../components/DisasterForm";
export default function NewDisaster({ data, act, busy }) {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">BUILD YOUR SCENARIO</div>
          <h1>New disaster</h1>
          <p>
            A clear picture is the first step toward a coordinated response.
          </p>
        </div>
      </div>
      <DisasterForm
        data={data}
        busy={busy}
        onSubmit={async (body) => {
          if (
            await act(
              "/disaster",
              "POST",
              body,
              "Analysis complete. Your plan is ready.",
            )
          )
            navigate("/evacuation");
        }}
      />
    </>
  );
}
