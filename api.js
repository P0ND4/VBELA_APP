import axios from "axios";
import { writeFile, readFile } from "./helpers/offline";
import { socket } from "./socket";

const API = process.env.EXPO_PUBLIC_API_URL;

export const connect = async ({ data = {}, url, returnData = true }) => {
  try {
    const result = await axios.post(`${API}${url}`, data, { timeout: 3000 });

    if (data?.groups?.length > 0)
      socket.emit("change", {
        data: result.data,
        groups: data.groups,
        confidential: url === "/helper/edit",
      });

    return await result.data;
  } catch (e) {
    const error = { error: true, details: "api", type: e.message };

    if (!returnData) return error;

    const r = await readFile({ name: "data.json" });
    const value = !r.error ? r : [];
    const info = { url, data, creationDate: new Date().getTime() };
    const options = [
      "helper",
      "nomenclature",
      "table",
      "menu",
      "kitchen",
      "people",
      "economy",
    ];
    const typeOfData = url.slice(1).split("/")[0];
    const identification = options.includes(typeOfData) ? "id" : "ref";

    const index = value?.findIndex(
      (r) =>
        r.url.slice(1).split("/")[1] === "edit" &&
        r.url === url &&
        r.data?.[typeOfData]?.[identification] ===
          data?.[typeOfData]?.[identification]
    );

    if (index !== -1) {
      const data = value[index].url.slice(1).split("/")[1];
      if (data !== "add") {
        value.splice(index, 1);
        value.push(info);
      }
    } else if (url.slice(1).split("/")[1] === "remove") {
      const toDelete = value.filter(
        (v) => v.data?.[typeOfData]?.[identification] === data?.[identification]
      );
      for (let d of toDelete) {
        const index = value.findIndex(
          (v) =>
            v.data?.[typeOfData]?.[identification] ===
            d.data?.[typeOfData]?.[identification]
        );
        value.splice(index, 1);
      }
      value.push(info);
    } else value.push(info);

    await writeFile({ name: "data.json", value });

    return error;
  }
};

export const getUser = async (data) =>
  await connect({ data, url: "/user", returnData: false });

export const addUser = async (data) =>
  await connect({ data, url: "/user/add", returnData: false });

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

export const orderInvoice = async (data) =>
  await connect({ data, url: "/order/invoice" });

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

export const removeManyEconomy = async (data) =>
  await connect({ data, url: "/economy/remove/many" });

export const getRule = async () =>
  await connect({ url: "/rule", returnData: false });

export const addMenu = async (data) =>
  await connect({ data, url: "/menu/add" });

export const editMenu = async (data) =>
  await connect({ data, url: "/menu/edit" });

export const removeMenu = async (data) =>
  await connect({ data, url: "/menu/remove" });

export const addKitchen = async (data) =>
  await connect({ data, url: "/kitchen/add" });

export const editKitchen = async (data) =>
  await connect({ data, url: "/kitchen/edit" });

export const removeKitchen = async (data) =>
  await connect({ data, url: "/kitchen/remove" });

export const removeManyKitchen = async (data) =>
  await connect({ data, url: "/kitchen/remove/many" });

export const addRoster = async (data) =>
  await connect({ data, url: "/roster/add" });

export const editRoster = async (data) =>
  await connect({ data, url: "/roster/edit" });

export const removeRoster = async (data) =>
  await connect({ data, url: "/roster/remove" });

export const addPerson = async (data) =>
  await connect({ data, url: "/people/add" });

export const editPerson = async (data) =>
  await connect({ data, url: "/people/edit" });

export const removePerson = async (data) =>
  await connect({ data, url: "/people/remove" });

export const verifyPhoneNumber = async ({ phoneNumber, channel }) =>
  await connect({
    url: `/verify/phone/${phoneNumber}/${channel}`,
    returnData: false,
  });

export const checkPhoneNumberVerification = async ({ phoneNumber, code }) =>
  await connect({
    url: `/check/phone/${phoneNumber}/${code}`,
    returnData: false,
  });
