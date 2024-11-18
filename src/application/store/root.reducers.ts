import { combineReducers } from "@reduxjs/toolkit";
import slices from "application/slice";

const rootReducer = combineReducers(slices);

export default rootReducer;
