import React, { useState } from "react";
import { View } from "react-native";
import MultiSelectComponent, { DropdownItem } from "./DevComponont";

const data: DropdownItem[] = [
  { label: "Item 1", value: "1" },
  { label: "Item 2", value: "2" },
  { label: "Item 3", value: "3" },
  { label: "Item 4", value: "4" },
  { label: "Item 5", value: "5" },
  { label: "Item 6", value: "6" },
  { label: "Item 7", value: "7" },
  { label: "Item 8", value: "8" },
];

const ParentComponent: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  console.log("Items", selected);

  return (
    <View>
      <MultiSelectComponent data={data} selected={selected} onSelectedChange={setSelected} />
      {/* You can now access `selected` anywhere within this parent component */}
    </View>
  );
};

export default ParentComponent;
