import { createContext, useContext } from "react";

import { ElementProps } from "../Pages/PageUtility/VFELoader";

export const VFELoaderContext = createContext<ElementProps | null>(null);

export function useVFELoaderContext() {
  const VFEContext = useContext(VFELoaderContext);
  if (!VFEContext) {
    throw "No provider for VFE Loader Context, can't use without provider!";
  }
  return VFEContext as ElementProps;
}
