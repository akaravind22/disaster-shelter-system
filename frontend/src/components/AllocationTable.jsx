import { House } from "lucide-react";
export default function AllocationTable({ data }) {
  return (
    <div>
      {data.allocations.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SHELTER</th>
                <th>PEOPLE ASSIGNED</th>
                <th>PLAN STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.allocations.map((a) => (
                <tr key={a.shelter_id}>
                  <td>
                    <span className="table-icon">
                      <House size={16} />
                    </span>
                    <strong>{a.name}</strong>
                    <small>{a.shelter_id}</small>
                  </td>
                  <td>
                    <strong>{a.people}</strong> people
                  </td>
                  <td>
                    <span className="badge safe">Allocated</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          No eligible shelters. Update shelter or road conditions.
        </div>
      )}
      <div className="allocation-footer">
        <span>
          {data.allocated} of {data.disaster.population} people allocated
        </span>
        <strong className={data.unallocated ? "text-danger" : "text-success"}>
          {data.unallocated
            ? data.unallocated + " unallocated"
            : "All people accommodated"}
        </strong>
      </div>
    </div>
  );
}
