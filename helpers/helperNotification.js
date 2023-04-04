import sendNotification from "./sendNotification";

export default helperNotification = async (activeGroup, user, title, body) => {
  if (activeGroup.active) {
    const devices = activeGroup.expoID.filter(
      (expoID) => expoID !== user.expoID && expoID !== ""
    );

    if (devices.length !== 0)
      await sendNotification({ title, body, array: devices });
  } else {
    const helpers = user.helpers.filter(
      (helper) => helper.accessToReservations
    );
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
