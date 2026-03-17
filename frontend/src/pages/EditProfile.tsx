import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import { useEditProfile } from "@/hooks/useEditProfile";
import { useBoxes } from "@/hooks/useBoxes";

const EditProfile = () => {
  const { profile } = useAuth();
  const categories = [
  "FITNESS",
  "SCALED",
  "AMADOR",
  "RX",
  "MASTER"
];
  const gender = [
    "FEMININO",
    "MASCULINO",
  ];

  const { boxes } = useBoxes();
  const { form, saving, handleChange, handleSave } = useEditProfile();
  const navigate = useNavigate();
  
  if (!profile) return null;

  const inputClass =
    "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  
  return (
    <AppLayout>
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-bold">Editar Perfil</h1>
        </div>

        <div className="space-y-4">

          {/* USERNAME */}
          <div>
            <label className="text-xs text-muted-foreground">Username</label>
            <input
              value={form.username}
              onChange={e => handleChange("username", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* NOME */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nome</label>
              <input
                value={form.first_name}
                onChange={e => handleChange("first_name", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Sobrenome</label>
              <input
                value={form.last_name}
                onChange={e => handleChange("last_name", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* BOX */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Box
            </label>
            
            <select
              className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={form.box}
              
              onChange={e => handleChange("box", e.target.value)}
            >
              <option value="">Selecione um box</option>

              {boxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.box_name}
                </option>
              ))}
            </select>
          </div>
            
          {/* CATEGORY */}
          <div>
            <label className="text-xs text-muted-foreground">Categoria</label>
            <select className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* GENERO */}
          <div>
            <label className="text-xs text-muted-foreground">Gênero</label>
            <select className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
              {gender.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* PESO / ALTURA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Peso</label>
              <input
                type="number"
                value={form.weight}
                onChange={e => handleChange("weight", e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Altura</label>
              <input
                type="number"
                value={form.height}
                onChange={e => handleChange("height", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* BOTÃO */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg gradient-fire py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>

        </div>
      </div>
    </AppLayout>
  );
};

export default EditProfile;
