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
        {entries.map(([key, value]) => {
          const parentLabel = tailoringDetailsMap[key.trim()] || key.replace(/_/g, " ");

          return (
            <TableRow key={key}>
              <TableCell className="capitalize font-medium">
                {parentLabel}
              </TableCell>
              <TableCell>
                <ul className="space-y-0.5">
                  {Object.entries(value || {}).map(([subKey, val]) => {
                    if (val === "no" || val === "" || val === null || val === undefined || val === false) {
                      return null;
                    }

                    let rawVal = String(val).trim();
                    if (rawVal.toLowerCase() === "no") return null;

                    // Clean rawVal if it ends with ": yes" or ": true"
                    rawVal = rawVal.replace(/:\s*(yes|true)$/i, "").trim();

                    // If value contains long color choices string e.g. "Piping material / गोल्डन, रोज़ गोल्ड, सिल्वर, ब्लैक, व्हाइट (कंपनी के फ़ैब्रिक की लगेगी)"
                    // cut at comma to keep only selected choice:
                    if (rawVal.includes(",") || rawVal.includes("गोल्डन,")) {
                      rawVal = rawVal.split(/[,]/)[0].trim();
                    }

                    let subLabel = (tailoringDetailsMap[subKey.trim()] || subKey.replace(/_/g, " "))
                      .replace(/\s*type\s*/gi, "")
                      .trim();

                    const isValYes = rawVal.toLowerCase() === "yes" || rawVal.toLowerCase() === "true";

                    const normSub = subLabel.toLowerCase().replace(/[^a-z]/g, "");
                    const normParent = parentLabel.toLowerCase().replace(/[^a-z]/g, "");
                    const isRedundant =
                      normSub === normParent ||
                      (normSub.includes("piping") && normParent.includes("piping"));

                    let displayText = "";
                    if (isValYes) {
                      displayText = subLabel;
                    } else if (isRedundant) {
                      displayText = rawVal;
                    } else if (rawVal.toLowerCase().startsWith(subLabel.toLowerCase())) {
                      displayText = rawVal;
                    } else {
                      displayText = `${subLabel}: ${rawVal}`;
                    }

                    return <li key={subKey}>{displayText}</li>;
                  })}
                </ul>
              </TableCell>
            </TableRow>
          );
        })}
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