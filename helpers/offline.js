import * as FileSystem from "expo-file-system";

const directory = FileSystem.documentDirectory;

const makeDirectory = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(directory + "offline");

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory + "offline");
    }
  } catch (e) {
    console.log(e.message);
  }
};

const findFile = async ({ name }) =>
  await FileSystem.getInfoAsync(directory + `offline/${name}`);

export const writeFile = async ({ name, value }) => {
  await makeDirectory();
  await FileSystem.writeAsStringAsync(
    directory + `offline/${name}`,
    JSON.stringify(value)
  );
};

export const readFile = async ({ name }) => {
  await makeDirectory();

  const fileInfo = await findFile({ name });

  if (fileInfo.exists) {
    const res = JSON.parse(
      await FileSystem.readAsStringAsync(directory + `offline/${name}`)
    );

    return res;
  }

  return { error: true, type: "The file dont exists" };
};

export const removeFile = async ({ name }) => {
  await makeDirectory();

  const fileInfo = await findFile({ name });
  
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(
      FileSystem.documentDirectory + `offline/${name}`
    );
  }
};
