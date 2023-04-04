import axios from "axios";

export default sendNotification = async ({ title, body, to, array = [] }) => {
  const schema = {
    title,
    sound: "default",
    badge: 1,
    body,
  };

  const messages = [];

  if (array.length === 0) schema.to = to;
  else {
    for (let expoID of array) {
      if (expoID) {
        messages.push({
          ...schema,
          to: expoID,
        });
      }
    }
  }

  if (array.length === 0 && !to) return "There is no goal";

  const res = await axios.post(
    "https://exp.host/--/api/v2/push/send",
    array.length > 0 ? messages : schema
  );

  return res.data;
};
