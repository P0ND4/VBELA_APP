import { editHelper, getUser } from "@api";
import sendNotification from "./sendNotification";

export default helperCameOut = async (activeGroup, user) => {
  const data = await getUser({ email: activeGroup.email });
  const userFound = data.helpers.find((helper) => helper.id === activeGroup.id);
  const expoID = userFound.expoID.filter((expoID) => expoID !== user.expoID);
  
  await editHelper({
    email: activeGroup.email,
    helper: { ...userFound, expoID },
  });

  if (expoID.length !== 0)
    await sendNotification({
      title: `Un usuario ha salido de ${activeGroup.user}`,
      body: `Correo: ${user.email}`,
      array: expoID,
    });
};
