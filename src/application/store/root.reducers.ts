import { combineReducers } from "@reduxjs/toolkit";
import slices from "application/slice";
import appState from "application/appState";

const rootReducer = combineReducers({ ...slices, ...appState });

export default rootReducer;
