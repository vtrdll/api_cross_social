import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import AppLayout from '@/components/layout/AppLayout';
import { ImagePlus, X, Send, Film } from 'lucide-react';

const CreatePost = () => {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected]);
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          url: reader.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && files.length === 0) return;
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('text', text);
      files.forEach(file => {
        formData.append('media', file);
      });
      await createPost(formData);
      navigate('/');
    } catch {
      setError('Erro ao criar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground">Novo Post</h1>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!text.trim() && files.length === 0)}
            className="rounded-lg gradient-fire px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>

        {/* Upload area */}
        {previews.length === 0 ? (
          <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-primary/50 transition-colors">
            <ImagePlus className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Toque para adicionar fotos ou vídeos</p>
            <p className="text-xs text-muted-foreground mt-1">Múltiplos arquivos permitidos</p>
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-square">
                  {p.type === 'image' ? (
                    <img src={p.url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={p.url} className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => removeFile(i)} className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5">
                    <X className="h-4 w-4 text-foreground" />
                  </button>
                  {p.type === 'video' && (
                    <div className="absolute bottom-2 left-2">
                      <Film className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center rounded-lg border border-dashed border-border bg-secondary py-3 cursor-pointer hover:border-primary/50 transition-colors">
              <span className="text-sm text-muted-foreground">+ Adicionar mais</span>
              <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        )}

        {/* Caption */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma legenda..."
          rows={4}
          className="mt-4 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </AppLayout>
  );
};

export default CreatePost;
