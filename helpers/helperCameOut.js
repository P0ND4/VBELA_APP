import { editHelper, getUser } from "@api";
import sendNotification from "./sendNotification";

export default helperCameOut = async (helperStatus, user) => {
  const data = await getUser({ email: helperStatus.email });
  const userFound = data.helpers.find((helper) => helper.id === helperStatus.id);
  const expoID = userFound.expoID.filter((expoID) => expoID !== user.expoID);
  
  await editHelper({
    email: helperStatus.email,
    helper: { ...userFound, expoID },
  });

  if (expoID.length !== 0)
    await sendNotification({
      title: `Un usuario ha salido de ${helperStatus.user}`,
      body: `Correo: ${user.email}`,
      array: expoID,
    });
};
