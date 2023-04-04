import axios from "axios";
import { writeFile, readFile } from "./helpers/offline";
import { socket } from "./socket";

const production = true;

const API = production ? "http://165.22.4.43" : "http://192.168.230.48:5031";

export const connect = async ({ data, url }) => {
  try {
    const result = await axios.post(`${API}${url}`, data, { timeout: 5000 });

    if (data.groups?.length > 0)
      socket.emit("change", { data: result, groups: data.groups });

    return await result.data;
  } catch (e) {
    const error = { error: true, type: "Timeout of 5000ms exceeded" };

    if (url === "/user") return error;

    if (e.message === "timeout of 5000ms exceeded") {
      const r = await readFile({ name: "data.json" });
      const value = r ? r : [];
      const info = { url, data, creationDate: new Date().getTime() };
      const typeOfProperty = data.ref ? "ref" : "id";
      const identification = data.ref ? data.ref : data.id;

      const index = value?.findIndex(
        (r) =>
          r.url.slice(1).split("/")[1] === "edit" &&
          r.url === url &&
          r.data[typeOfProperty] === identification
      );
      if (index !== -1) {
        const data = value[index].url.slice(1).split("/")[1];
        if (data !== "add") {
          value.splice(index, 1);
          value.push(info);
        }
      } else if (url.slice(1).split("/")[1] === "remove") {
        const toDelete = value.filter((v) => v.data[typeOfProperty] === identification);
        for (let d of toDelete) {
          const index = value.findIndex(
            (v) => v.data[typeOfProperty] === d.data[typeOfProperty]
          );
          value.splice(index, 1);
        }
      } else value.push(info);

      if (!r) await writeFile({ name: "data.json", value });
      else await writeFile({ name: "data.json", value });

      return error;
    }
  }
};

export const getUser = async (data) => await connect({ data, url: "/user" });

export const addUser = async (data) =>
  await connect({ data, url: "/user/add" });

export const editUser = async (data) =>
  await connect({ data, url: "/user/edit" });

export const addGroup = async (data) =>
  await connect({ data, url: "/group/add" });

export const editGroup = async (data) =>
  await connect({ data, url: "/group/edit" });

export const removeGroup = async (data) =>
  await connect({ data, url: "/group/remove" });

export const addNomenclature = async (data) =>
  await connect({ data, url: "/nomenclature/add" });

export const editNomenclature = async (data) =>
  await connect({ data, url: "/nomenclature/edit" });

export const removeNomenclature = async (data) =>
  await connect({ data, url: "/nomenclature/remove" });

export const addTable = async (data) =>
  await connect({ data, url: "/table/add" });

export const editTable = async (data) =>
  await connect({ data, url: "/table/edit" });

export const removeTable = async (data) =>
  await connect({ data, url: "/table/remove" });

export const addHelper = async (data) =>
  await connect({ data, url: "/helper/add" });

export const editHelper = async (data) =>
  await connect({ data, url: "/helper/edit" });

export const removeHelper = async (data) =>
  await connect({ data, url: "/helper/remove" });

export const addOrder = async (data) =>
  await connect({ data, url: "/order/add" });

export const editOrder = async (data) =>
  await connect({ data, url: "/order/edit" });

export const removeOrder = async (data) =>
  await connect({ data, url: "/order/remove" });

export const addReservation = async (data) =>
  await connect({ data, url: "/reservation/add" });

export const editReservation = async (data) =>
  await connect({ data, url: "/reservation/edit" });

export const removeReservation = async (data) =>
  await connect({ data, url: "/reservation/remove" });

export const addEconomy = async (data) =>
  await connect({ data, url: "/economy/add" });

export const editEconomy = async (data) =>
  await connect({ data, url: "/economy/edit" });

export const removeEconomy = async (data) =>
  await connect({ data, url: "/economy/remove" });
