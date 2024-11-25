"use client";
import { TailorDBTypesResult, WorkspaceResult } from "@/app/types";
import { useState } from "react";

type ContentProps = {
  workspace: WorkspaceResult["workspace"];
  tailorDBTypes: TailorDBTypesResult["tailordbTypes"];
};

type TailorDBTypes = TailorDBTypesResult["tailordbTypes"];
type TailorDBType = TailorDBTypes[number];

const TypeSelector = (props: {
  types: TailorDBTypesResult["tailordbTypes"];
  onChange: (type: TailorDBType) => void;
}) => {
  const { types } = props;

  return (
    <select
      onChange={(e) => {
        const selectedType = types.find((type) => type.name === e.target.value);
        if (!selectedType) {
          return;
        }

        props.onChange(selectedType);
      }}
    >
      {types.map((type) => (
        <option key={type.name} value={type.name}>
          {type.name}
        </option>
      ))}
    </select>
  );
};

export const Content = (props: ContentProps) => {
  const [currentType, setCurrentType] = useState<TailorDBType | null>(null);
  const { workspace } = props;

  console.log(currentType);

  return (
    <div>
      <div>Workspace: {workspace.name}</div>
      <TypeSelector types={props.tailorDBTypes} onChange={setCurrentType} />
    </div>
  );
};
