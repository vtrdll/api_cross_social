import { useState } from "react";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useEditProfile = () => {
  const { profile, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    username: profile?.username || "",
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    box: profile.box || "", // 
    category: profile?.category || "",
    genre: profile?.genre || "",
    weight: profile?.weight?.toString() || "",
    height: profile?.height?.toString() || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string | number) => {
  setForm(prev => ({
    ...prev,
    [key]: value,
  }));
};

  const handleSave = async () => {
    setSaving(true);

    try {
      await api.patch("/profile/update/", {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        box: form.box,
        category: form.category,
        genre: form.genre,
        weight: form.weight ? parseFloat(form.weight) : null,
        height: form.height ? parseFloat(form.height) : null,
      });

      await refreshProfile();

      toast({
        title: "Perfil atualizado com sucesso!",
      });
    } catch {
      toast({
        title: "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    saving,
    handleChange,
    handleSave,
  };
};
