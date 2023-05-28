import sendNotification from "./sendNotification";

// OPCION 1 EL SOCKETIO DEL ANDMIN/ESCLAVO NO SE ESTA GUARDANDO EN HELPER
// OPCION 2 HAY UN PROBLEMA CON LA SELECCION DE DISPOSITIVOS
// OPCION 3 CUANDO HAY UN CAMBIO EN EL TIPO DE USUARIO NO SE SINCRONIZAN
// LA LOGICA FALLA EN ESTA PORCION DE CODIGO O EN EL ENVIO DE LA NOTIFICACION

export default helperNotification = async (activeGroup, user, title, body, access) => {
  if (activeGroup.active) {
    const devices = activeGroup.expoID.filter(
      (expoID) => expoID !== user.expoID && expoID !== ""
    );

    if (devices.length !== 0)
      await sendNotification({ title, body, array: devices });
  } else {
    const helpers = user.helpers.filter((helper) => helper[access]);
    const expoID = [];
    for (let helper of helpers) {
      expoID.push(...helper.expoID);
    }
    const unique = expoID.filter((id, index) => expoID.indexOf(id) === index);
    const devices = unique.filter((expoID) => expoID !== user.expoID);
    if (devices.length !== 0) {
      await sendNotification({ title, body, array: devices });
    }
  }
};
