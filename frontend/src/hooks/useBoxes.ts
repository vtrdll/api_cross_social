import { useState, useEffect } from "react";
import api from "@/services/api";

export type Box = {
  id: number;
  box_name: string;
};

export const useBoxes = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        const { data } = await api.get("/list_box/");
        setBoxes(data.results ?? data);
      } catch (error) {
        console.error("Erro ao buscar boxes", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoxes();
  }, []);

  return { boxes, isLoading };
};
