import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { bodyMeasurementDisplayOrder, tailoringDetailsMap } from "@/services/constants";


type MeasurementsTableProps = {
  measurements: {
    optionsData?: any;
    bodyMeasurement?: any;
  };
};

export default function MeasurementsTable({
  measurements,
}: MeasurementsTableProps) {
  const { optionsData = {}, bodyMeasurement = {} } = measurements || {};
  const { category = 'defaultCategory', ...normalizedOptions } = optionsData;

 const renderBodyMeasurementsSectionInDefaultOrder = (
    title: string,
    data?: any,
  ) => {
    if (!data)
      return null;

    const entries = Object.entries(data);

    if (entries.length === 0) {
      return;
    }

    return (
      <div className="grid gap-0 border border-gray-400 text-sm"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="border border-gray-400 p-2 break-words"
            style={{ minWidth: '0' }}
          >
            <p className="font-semibold whitespace-normal">
              {tailoringDetailsMap[key.trim()] || key.replace(/_/g, " ")}
            </p>
            <p>{(value as any) || "-"}</p>
          </div>
        ))}
      </div>

    );
  }; 

  const renderBodyMeasurementsSection = (
    title: string,
    data?: any,
  ) => {
    if (!data)
      return null;

    const displayOrder = bodyMeasurementDisplayOrder[data?.category?.trim() || ""];

    if (!displayOrder) {
      return renderBodyMeasurementsSectionInDefaultOrder(title, data);
    }

    if (displayOrder?.length === 0) {
      return renderBodyMeasurementsSectionInDefaultOrder(title, data);
    }

    return (
      <div className="grid gap-0 border border-gray-400 text-sm"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {displayOrder?.filter(key => data[key] !== undefined).map((key) => (
          <div
            key={key}
            className="border border-gray-400 p-2 break-words"
            style={{ minWidth: '0' }}
          >
            <p className="font-semibold whitespace-normal">
              {tailoringDetailsMap[key.trim()] || key.replace(/_/g, " ")}
            </p>
            <p>{(data[key] as any) || "-"}</p>
          </div>
        ))}
      </div>

    );
  };


  const renderTailoringOptionsSection = (
    title: string,
    data?: any,
  ) => {
    if (!data)
      return null;

    const entries = Object.entries(data);

    if (entries.length === 0) {
      return;
    }

    return (
      <>
        <TableRow>
          <TableCell colSpan={2} className="font-semibold bg-gray-50">
            {title} —{" "}
            {category || ""}
          </TableCell>
        </TableRow>
        {entries.map(([key, value]) => (
          <TableRow key={key}>
            <TableCell className="capitalize">
              {tailoringDetailsMap[key.trim()] || key.replace(/_/g, " ")}
            </TableCell>
            <TableCell>
              <ul>
                {
                  Object.entries(value).map(([key, val]) => {
                    if (val === "no" || val === "") {
                      return null
                    }
                    return <li key={key}>{tailoringDetailsMap[key.trim()]?.replace("type", "") || key.replace(/_/g, " ")?.replace("type", "")}: {val as string}</li>
                  })
                }
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };



  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Measurement</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="w-full">
          {true ? (
            <>
              {renderTailoringOptionsSection("Tailoring Options", normalizedOptions)}

            </>
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-gray-500">
                No measurements available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div>
        <p>Body measurements</p>
        {renderBodyMeasurementsSection("Body Measurements", bodyMeasurement)}
      </div>
    </div >
  );
}