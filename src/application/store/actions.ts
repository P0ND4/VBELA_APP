import { createAction } from "@reduxjs/toolkit";
import { Collection } from "domain/entities/data/user";

export const cleanAll = createAction("cleanAll");
export const changeAll = createAction<Collection>("changeAll");
