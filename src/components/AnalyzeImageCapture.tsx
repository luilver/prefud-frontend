import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeImageJob } from "@/services/pantryService";
import { useAnalyzeImageJob } from "@/contexts/AnalyzeImageJobContext";

interface AnalyzeImageCaptureProps {
  onBack: () => void;
  onJobStarted: () => void;
}

const AnalyzeImageCapture = ({ onBack, onJobStarted }: AnalyzeImageCaptureProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useLanguage();
  const { startJob } = useAnalyzeImageJob();

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    if (!user?.id) {
      toast({
        title: t("addIngredient.error") || "Error",
        description: t("addIngredient.userNotFound") || "User not found",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { jobId } = await analyzeImageJob(user.id, preview);
      startJob(jobId);
      toast({
        title: t("analyzeImageStarted.title") || "Image Analysis Started",
        description: t("analyzeImageStarted.description") || "We'll notify you when ingredients are detected",
        duration: 5000,
      });
      onJobStarted();
    } catch (err: any) {
      console.error("analyzeImageJob error:", err);
      toast({
        title: t("addIngredient.error") || "Error",
        description: err?.response?.data?.message || err?.message || "Failed to submit image",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-700 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            {t("addIngredient.scanWithCamera") || "Scan ingredients"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("addIngredient.back") || "Back"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("addIngredient.scanWithCameraDesc") ||
            "Take a photo or upload an image of your ingredients and we'll detect them automatically."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {preview ? (
          <div className="space-y-3">
            <img
              src={preview}
              alt="Selected ingredient photo"
              className="w-full max-h-64 object-contain rounded-lg border border-emerald-100 bg-gray-50"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPreview(null)}
                disabled={isSubmitting}
              >
                {t("addIngredient.retake") || "Choose another"}
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("addIngredient.analyzing") || "Analyzing…"}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("addIngredient.analyzePhoto") || "Analyze Photo"}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              <Camera className="h-7 w-7" />
              <span>{t("addIngredient.takePhoto") || "Take Photo"}</span>
            </Button>
            <Button
              onClick={() => uploadInputRef.current?.click()}
              variant="outline"
              className="h-24 flex-col gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Upload className="h-7 w-7" />
              <span>{t("addIngredient.uploadPhoto") || "Upload Photo"}</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyzeImageCapture;