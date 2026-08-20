import { useContext } from "react";
import { SIHContext } from "../context/SIHContext";

export function useSIH() {
  const context = useContext(SIHContext);
  if (!context) throw new Error("useSIH must be used within SIHProvider");
  return context;
}
