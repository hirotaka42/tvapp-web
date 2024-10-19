import { FC, ReactNode } from "react";
import classes from "@/Components/shared/Layout.module.css";

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={classes.layout}>{children}</div>;
};