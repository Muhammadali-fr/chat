"use client"
import { useEffect, useState } from "react";
import { generateAnimalUsername } from "../components/Generateusername";
export const useUsername = () => {
    const [username, setUsername] = useState("");
    const STORAGE_KEY = "username_key";

    useEffect(() => {
        const main = () => {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored) {
                setUsername(stored);
                return
            }

            const generated = generateAnimalUsername();
            localStorage.setItem(STORAGE_KEY, generated);
            setUsername(generated);
        };

        main();

    }, []);
    return { username };
}