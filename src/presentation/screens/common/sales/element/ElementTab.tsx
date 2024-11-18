import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Element } from "domain/entities/data/common/element.entity";
import StockElement from "./ElementStock";
import CreateElement from "./ElementForm";

const Tab = createMaterialTopTabNavigator();

type ElementTabProps = {
  onSubmit: (data: Element) => void;
  defaultValue?: Element;
  locationID: string;
};

const ElementTab: React.FC<ElementTabProps> = ({ onSubmit, defaultValue, locationID }) => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="REGISTRO">
        {(props: any) => (
          <CreateElement
            {...props}
            onSubmit={onSubmit}
            defaultValue={defaultValue}
            locationID={locationID}
          />
        )}
      </Tab.Screen>
      {/* <Tab.Screen name="STOCK" component={StockElement} /> */}
      {/* <Tab.Screen name="RECETA" component={() => <View />} /> */}
    </Tab.Navigator>
  );
};

export default ElementTab;
