import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { changeAll, cleanAll } from "application/store/actions";
import { InvoiceInformation } from "domain/entities/data/settings/invoice.information.entity";
import { Collection } from "domain/entities/data/user";
import countries from "shared/data/countries.json";

import * as localization from "expo-localization";

const invoiceInformation = (collection: Collection) => collection.invoiceInformation;

const regionCode = localization.getLocales()[0].regionCode;
const found = countries.find((c) => c.country_short_name === regionCode);

const initialState: InvoiceInformation = {
  company: "VBELA",
  business: "",
  address: "",
  identification: "",
  countryCode: found?.country_phone_code || 1,
  phoneNumber: "",
  complement: "",
};

export const invoiceInformationSlice = createSlice({
  name: "invoice-information",
  initialState,
  reducers: {
    change: (_, action: PayloadAction<InvoiceInformation>) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(cleanAll, () => initialState);
    builder.addCase(changeAll, (_, action) => invoiceInformation(action.payload!));
  },
});

export const { change } = invoiceInformationSlice.actions;
export default invoiceInformationSlice.reducer;
