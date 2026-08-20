import { useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, Star, ArrowLeft, ArrowRight, Loader2, AlertTriangle, Video, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;

type UploadError = { file: string; reason: string };

export function ImageUploader({
  images,
  cover,
  videoUrl,
  onChange,
  onCover,
  onVideoUrlChange,
  max = MAX_IMAGES,
}: {
  images: string[];
  cover: number;
  videoUrl?: string;
  onChange: (imgs: string[]) => void;
  onCover: (i: number) => void;
  onVideoUrlChange?: (v: string) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [errors, setErrors] = useState<UploadError[]>([]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const room = max - images.length;
    if (room <= 0) {
      setErrors([{ file: "", reason: `Maximum ${max} images reached` }]);
      return;
    }
    const arr = Array.from(files).slice(0, room);
    const errs: UploadError[] = [];
    const accepted: File[] = [];
    for (const f of arr) {
      if (!ACCEPTED.includes(f.type)) errs.push({ file: f.name, reason: "Unsupported format" });
      else if (f.size > MAX_SIZE) errs.push({ file: f.name, reason: "File too large (max 10MB)" });
      else accepted.push(f);
    }
    setErrors(errs);
    if (accepted.length === 0) return;
    setUploading(true);
    Promise.all(
      accepted.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(f);
          })
      )
    )
      .then((dataUrls) => {
        onChange([...images, ...dataUrls]);
        setUploading(false);
      })
      .catch(() => setUploading(false));
  }

  function handleVideoFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("video/")) {
      setErrors([{ file: file.name, reason: "File must be a valid video format (MP4, WebM, MOV)" }]);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrors([{ file: file.name, reason: "Video file size must be less than 50MB" }]);
      return;
    }

    setUploadingVideo(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      onVideoUrlChange?.(dataUrl);
      setUploadingVideo(false);
    };
    reader.onerror = () => {
      setErrors([{ file: file.name, reason: "Failed to read video file" }]);
      setUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = images.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (cover === i) onCover(j);
    else if (cover === j) onCover(i);
  }

  function remove(i: number) {
    const next = images.filter((_, k) => k !== i);
    onChange(next);
    if (cover >= next.length) onCover(Math.max(0, next.length - 1));
  }

  return (
    <section aria-label="Photos" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Photos <span className="text-muted-foreground">({images.length} of {max})</span>
        </div>
        {uploading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <div key={src + i} className={cn("relative aspect-square overflow-hidden rounded-xl border", cover === i ? "border-yellow-brand ring-2 ring-yellow-brand/40" : "border-border")}>
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-1">
              <button
                type="button"
                onClick={() => onCover(i)}
                aria-label={cover === i ? "Cover image" : "Set as cover"}
                className={cn("grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold shadow", cover === i ? "bg-yellow-brand text-navy" : "bg-white/90 text-navy")}
              >
                <Star className={cn("h-3.5 w-3.5", cover === i && "fill-navy")} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-600 shadow"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move earlier" disabled={i === 0}
                className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-navy shadow disabled:opacity-40">
                <ArrowLeft className="h-3 w-3" />
              </button>
              {cover === i && <span className="rounded-full bg-yellow-brand px-1.5 text-[10px] font-bold text-navy">Cover</span>}
              <button type="button" onClick={() => move(i, 1)} aria-label="Move later" disabled={i === images.length - 1}
                className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-navy shadow disabled:opacity-40">
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary"
            aria-label="Add photo"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px] font-semibold">Add Photo</span>
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => camRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2.5 text-sm font-semibold">
          <Camera className="h-4 w-4" /> Camera
        </button>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-2.5 text-sm font-semibold">
          <ImagePlus className="h-4 w-4" /> Gallery
        </button>
      </div>

      <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} multiple hidden
        onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ""; }} />

      {errors.length > 0 && (
        <div role="alert" className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          {errors.map((e, i) => (
            <p key={i} className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{e.file ? `${e.file}: ` : ""}{e.reason}</span>
            </p>
          ))}
        </div>
      )}

      {/* Product Video Direct File Upload */}
      <div className="pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Video className="h-4 w-4 text-indigo-brand" /> Product Video Preview (Optional)
          </label>
          {uploadingVideo && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-brand">
              <Loader2 className="h-3 w-3 animate-spin" /> Processing video…
            </span>
          )}
        </div>

        {!videoUrl ? (
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingVideo}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-brand/30 bg-indigo-brand/5 p-4 text-xs font-extrabold text-indigo-brand hover:bg-indigo-brand/10 transition-all disabled:opacity-50"
            >
              {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{uploadingVideo ? "Uploading Video..." : "Upload Video File (MP4, WebM, MOV)"}</span>
            </button>
            <p className="text-[10px] text-center text-muted-foreground">Select a video file from your device (Max size 50MB)</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 border border-border flex items-center justify-center group">
            {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
              <iframe
                src={videoUrl.replace("watch?v=", "embed/")}
                className="w-full h-full"
                title="Product Video Preview"
                allowFullScreen
              />
            ) : (
              <video src={videoUrl} controls className="w-full h-full object-contain" />
            )}
            <button
              type="button"
              onClick={() => onVideoUrlChange?.("")}
              className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-all shadow-md"
              aria-label="Remove video"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            handleVideoFile(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>

      <div className="rounded-xl bg-secondary/60 p-3 text-[11px] text-muted-foreground">
        <p className="font-semibold text-foreground">Photo tips</p>
        <ul className="ml-4 mt-1 list-disc space-y-0.5">
          <li>Use clear, well-lit photographs</li>
          <li>Show the complete product from different angles</li>
          <li>Avoid phone numbers or promotional text in images</li>
        </ul>
      </div>
    </section>
  );
}
