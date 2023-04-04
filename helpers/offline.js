import * as FileSystem from "expo-file-system";

const directory = FileSystem.documentDirectory;

const makeDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + "offline"
  );

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "offline"
    );
  }
};

const findFile = async ({ name }) =>
  await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + `offline/${name}`
  );

export const writeFile = async ({ name, value }) => {
  makeDirectory();
  await FileSystem.writeAsStringAsync(
    directory + `offline/${name}`,
    JSON.stringify(value)
  );
};

export const readFile = async ({ name }) => {
  makeDirectory();

  const fileInfo = await findFile({ name });

  if (fileInfo.exists) {
    const res = JSON.parse(
      await FileSystem.readAsStringAsync(
        FileSystem.documentDirectory + `offline/${name}`
      )
    );

    return res;
  }
};

export const removeFile = async ({ name }) => {
  makeDirectory();

  const fileInfo = await findFile({ name });

  if (fileInfo.exists) {
    await FileSystem.deleteAsync(
      FileSystem.documentDirectory + `offline/${name}`
    );
  }
};
