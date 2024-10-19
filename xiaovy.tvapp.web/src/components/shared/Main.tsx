"use client";
import { FC } from "react";
import { Home } from "@/components/Pages/Home";
import Example from "@/components/atomicDesign/molecules/ItemLists"

export const Main: FC = () => {
    return (
        <>
        <h1>Main</h1>
        <Example />
        <Home />
        </>
    );
};