import React, { createContext } from "react";

export const CreateContext = createContext(undefined);

const CreateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CreateContext.Provider value={undefined}>{children}</CreateContext.Provider>;
};

export default CreateProvider;
