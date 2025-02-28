import React from "react";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabScreenProps,
} from "@react-navigation/material-top-tabs";
import { Element } from "domain/entities/data/common/element.entity";
import { random } from "shared/utils";
import { useForm } from "react-hook-form";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import StockElement from "./ElementStock";
import CreateElement from "./ElementForm";
import { UnitValue } from "shared/constants/unit";
import { Group } from "domain/entities/data";

const Tab = createMaterialTopTabNavigator();

type TabScreenProps = MaterialTopTabScreenProps<any, any>;

type ElementTabProps = {
  groups: Group[];
  inventories: string[];
  visible: Visible.Store | Visible.Restaurant;
  onSubmit: (data: Element) => void;
  defaultValue?: Element;
  locationID: string;
};

const ElementTab: React.FC<ElementTabProps> = ({
  groups,
  onSubmit,
  visible,
  inventories,
  defaultValue,
  locationID,
}) => {
  const initialValues: Element = {
    id: defaultValue?.id || random(10),
    locationID: defaultValue?.locationID || locationID,
    name: defaultValue?.name || "",
    price: defaultValue?.price || 0,
    cost: defaultValue?.cost || 0,
    promotion: defaultValue?.promotion || 0,
    categories: defaultValue?.categories || [],
    subcategories: defaultValue?.subcategories || [],
    description: defaultValue?.description || "",
    code: defaultValue?.code || "",
    unit: (defaultValue?.unit || "") as UnitValue,
    highlight: defaultValue?.highlight || false,
    activeStock: defaultValue?.activeStock || false,
    stock: defaultValue?.stock || 0,
    minStock: defaultValue?.minStock || 0,
    stockIDS: defaultValue?.stockIDS || [],
    packageIDS: defaultValue?.packageIDS || [],
    creationDate: defaultValue?.creationDate || new Date().getTime(),
    modificationDate: new Date().getTime(),
  };

  const { control, handleSubmit, watch, formState } = useForm<Element>({
    defaultValues: initialValues,
  });

  return (
    <Tab.Navigator>
      <Tab.Screen name="REGISTRO">
        {(props: TabScreenProps) => (
          <CreateElement
            {...props}
            groups={groups}
            onSubmit={onSubmit}
            control={control}
            handleSubmit={handleSubmit}
            watch={watch}
            formState={formState}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="STOCK">
        {(props: TabScreenProps) => (
          <StockElement
            {...props}
            visible={visible}
            inventories={inventories}
            control={control}
            watch={watch}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default ElementTab;
