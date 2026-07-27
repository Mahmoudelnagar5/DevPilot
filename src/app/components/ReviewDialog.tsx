import { useState, useEffect } from "react";
import { Star, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";
import { useApp } from "../AppContext";
import { submitReview, getUserReview, type PlatformReview } from "../lib/reviewsService";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ open, onOpenChange }: ReviewDialogProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { projects } = useApp();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<PlatformReview | null>(null);

  // Load existing review on mount
  useEffect(() => {
    if (open && user) {
      loadExistingReview();
    }
  }, [open, user]);

  const loadExistingReview = async () => {
    if (!user) return;
    
    const review = await getUserReview(user.id);
    if (review) {
      setExistingReview(review);
      setRating(review.rating);
      setReviewText(review.review_text);
      setSelectedProject(review.project_id || "");
    }
  };

  const reset = () => {
    if (!existingReview) {
      setRating(0);
      setReviewText("");
      setSelectedProject("");
    }
  };

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setLoading(true);

    const selectedProjectData = projects.find(p => p.id === selectedProject);
    const projectName = selectedProjectData?.name;

    const result = await submitReview(
      user.id,
      profile.full_name || user.email || "User",
      profile.role || "client",
      rating,
      reviewText,
      selectedProject || undefined,
      projectName
    );

    setLoading(false);

    if (result.success) {
      toast.success(existingReview ? "Review updated successfully!" : "Review submitted successfully! Thank you! 🎉");
      onOpenChange(false);
      reset();
    } else {
      toast.error(result.error || "Failed to submit review");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            {existingReview ? t("review.updateTitle") : t("review.submitTitle")}
          </DialogTitle>
          <DialogDescription>
            {existingReview ? t("review.updateDesc") : t("review.submitDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("review.rating")}</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} {t("review.outOf5")}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("review.yourReview")}</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              placeholder={t("review.placeholder")}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {reviewText.length}/500 {t("review.characters")}
            </div>
          </div>

          {/* Project Selection (Optional) */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("review.relatedProject")} ({t("review.optional")})</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">{t("review.selectProject")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0 || !reviewText.trim()}>
            {loading ? t("review.submitting") : (existingReview ? t("review.update") : t("review.submit"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
