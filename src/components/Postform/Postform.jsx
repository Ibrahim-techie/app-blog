import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Input, RTE } from "../index";
import {
  ArrowUpRight,
  Image as ImageIcon,
  ImagePlus,
  SlidersHorizontal,
} from "lucide-react";
import postservice from "../../services/Post.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import fileservice from "../../services/storage.service";
import { postPath, slugify } from "../../utils/postUrl";
import { compressImage } from "../../utils/compressImage";
import { toast } from "sonner";
import { CATEGORIES } from "../../constants/categories";
import { readingMinutes } from "../../utils/postText";

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

const notBlank = (label) => (value) =>
  value.trim().length > 0 || `${label} is required`;

function Postform({ post }) {
  const userData = useSelector((state) => state.auth.userData);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      status: post?.status || "active",
      author: post?.author || userData?.name || "",
      // Posts written before categories existed have none; "" shows the
      // "Choose a category" option and is saved back as null.
      category: post?.category || "",
    },
  });

  // Live preview of the readable part of the URL.
  const title = useWatch({ control, name: "title" });

  // Word count and reading time under the editor, from the live body.
  const content = useWatch({ control, name: "content" });
  const { words, minutes } = useMemo(() => {
    const text = content
      ? new DOMParser().parseFromString(content, "text/html").body.textContent ?? ""
      : "";
    const count = text.split(/\s+/).filter(Boolean).length;
    return { words: count, minutes: count ? readingMinutes(content) : 0 };
  }, [content]);

  // The chosen cover, previewed before upload; otherwise the current one.
  const imageFiles = useWatch({ control, name: "image" });
  const pickedFile = imageFiles?.[0];
  const pickedPreview = useMemo(
    () => (pickedFile ? URL.createObjectURL(pickedFile) : null),
    [pickedFile],
  );
  useEffect(
    () => () => pickedPreview && URL.revokeObjectURL(pickedPreview),
    [pickedPreview],
  );
  const coverPreview =
    pickedPreview ??
    (post?.featuredImage ? fileservice.filePreview(post.featuredImage) : null);

  const submit = async (data) => {
    setSubmitError("");

    // An image we uploaded that no saved post points to yet. If anything
    // fails before the save succeeds, it gets deleted so storage stays clean.
    let orphanImageId = null;

    // One toast that changes as the save progresses, rather than three stacked
    // ones. Passing the same id replaces the toast in place.
    // Wording follows the button pressed: Save Draft saves privately,
    // Publish / Update goes public.
    const isDraft = data.status === "inactive";
    const progressLabel = isDraft
      ? "Saving your draft…"
      : post
        ? "Saving your changes…"
        : "Publishing your post…";
    const toastId = toast.loading(progressLabel);

    try {
      let imageId = post?.featuredImage;

      if (data.image?.[0]) {
        const original = data.image[0];

        // Shrink before upload — a 4000px phone photo is shown in a 300px card.
        const picked = await compressImage(original);

        toast.loading("Uploading image…", {
          id: toastId,
          description:
            picked.size < original.size
              ? `Optimised ${formatBytes(original.size)} → ${formatBytes(picked.size)}`
              : undefined,
        });

        const file = await fileservice.fileUpload(picked);
        if (!file) {
          throw new Error("We couldn't upload your image. Please try again.");
        }
        imageId = file.$id;
        orphanImageId = file.$id;

        toast.loading(progressLabel, { id: toastId });
      }

      if (!imageId) {
        throw new Error("Please choose a featured image.");
      }

      const fields = {
        title: data.title.trim(),
        content: data.content,
        status: data.status,
        author: data.author.trim(),
        featuredImage: imageId,
        category: data.category || null,
      };

      const saved = post
        ? await postservice.updatePost(post.$id, {
            ...fields,
            userID: post.userID,
          })
        : await postservice.createPost({ ...fields, userID: userData.$id });

      // The saved post now uses the new image, so it is no longer an orphan.
      orphanImageId = null;

      // Replacing the image: remove the old one only after the save worked,
      // otherwise a failed save would leave the post pointing at nothing.
      if (post?.featuredImage && post.featuredImage !== imageId) {
        const removed = await fileservice.fileDelete(post.featuredImage);
        if (!removed) console.error("Old featured image could not be deleted");
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // The user is about to land on the post page, so this toast is the only
      // confirmation that the save actually succeeded.
      toast.success(isDraft ? "Draft saved" : post ? "Changes saved" : "Post published", {
        id: toastId,
        description:
          fields.status === "inactive"
            ? "Saved as a draft — only you can see it"
            : fields.title,
      });

      navigate(postPath(saved));
    } catch (error) {
      if (orphanImageId) await fileservice.fileDelete(orphanImageId);

      const message =
        error?.message || "Something went wrong while saving. Please try again.";

      // The toast carries the headline; the inline message stays beside the
      // submit button so the detail is still there after the toast fades.
      toast.error(post ? "Couldn't save your changes" : "Couldn't publish", {
        id: toastId,
      });
      setSubmitError(message);
    }
  };

  // Which status a button saves with. Save Draft keeps the post private;
  // Publish / Update makes it public — the same active/inactive status the
  // old Status dropdown set.
  const submitAs = (status) => handleSubmit((data) => submit({ ...data, status }));

  const isPublished = post?.status === "active";
  const draftLabel = isPublished ? "Move to Drafts" : "Save Draft";
  const publishLabel = post ? (isPublished ? "Update" : "Publish") : "Publish";

  return (
    <form onSubmit={submitAs("active")} noValidate>
      <div className="mb-7 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-extrabold tracking-[-0.6px] text-ink-text sm:text-[32px]">
            {post ? "Edit Post" : "Create a New Post"}
          </h1>
          <p className="text-[15px] text-ink-text-2">
            {post
              ? "Make changes to your post and save the updated version."
              : "Share your ideas, experiences, and knowledge with the world."}
          </p>
          {post && (
            <p className="font-mono text-[11px] text-ink-muted">
              {isPublished ? "PUBLISHED — VISIBLE TO EVERYONE" : "DRAFT — ONLY YOU CAN SEE THIS"}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {post && (
            <button
              type="button"
              onClick={() => navigate(postPath(post))}
              className="inline-flex h-[42px] items-center rounded-[3px] px-4 text-xs font-extrabold text-ink-text-2 hover:text-ink-text"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={submitAs("inactive")}
            disabled={isSubmitting}
            className="inline-flex h-[42px] items-center rounded-[3px] border border-ink-border bg-ink-surface px-4 text-[13px] font-semibold text-ink-text transition-colors hover:border-ink-border-strong disabled:opacity-60"
          >
            {draftLabel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-[42px] items-center rounded-[3px] border border-ink-border-strong bg-ink-primary px-4 text-[13px] font-semibold text-ink-on-primary disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : publishLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_296px]">
        {/* ======================================
            WRITING EDITOR
        ====================================== */}
        <div className="overflow-hidden rounded-[6px] border border-ink-border bg-ink-surface">
          {/* Title */}
          <div className="px-6 pt-7 pb-5 sm:px-8">
            <label htmlFor="post-title" className="sr-only">
              Title
            </label>
            <input
              id="post-title"
              placeholder="Add a catchy title for your post…"
              aria-invalid={Boolean(errors.title)}
              className="w-full bg-transparent text-[24px] font-bold tracking-[-0.6px] text-ink-text outline-none placeholder:text-ink-muted sm:text-[30px]"
              {...register("title", {
                required: "Title is required",
                validate: notBlank("Title"),
              })}
            />
            {errors.title ? (
              <p className="mt-2 text-xs text-ink-error">{errors.title.message}</p>
            ) : (
              <p className="mt-2 truncate font-mono text-[11px] text-ink-muted">
                URL: /post/
                <span className="text-ink-text-2">{title?.trim() ? slugify(title) : "…"}</span>/
                {post ? post.$id : "…"}
              </p>
            )}
          </div>

          {/* Cover */}
          <div className="px-6 pb-7 sm:px-8">
            <input
              id="post-cover"
              type="file"
              accept="image/png, image/jpg, image/jpeg, image/gif"
              className="sr-only"
              {...register("image", {
                required: !post ? "Featured image is required" : false,
              })}
            />
            {coverPreview ? (
              <div className="relative h-[230px] overflow-hidden rounded-[3px] bg-ink-surface-2">
                <img src={coverPreview} alt="" className="size-full object-cover" />
                <label
                  htmlFor="post-cover"
                  className="absolute right-3 bottom-3 inline-flex h-[34px] cursor-pointer items-center gap-2 rounded-[3px] border border-ink-border bg-ink-surface px-3 text-xs font-semibold text-ink-text"
                >
                  <ImageIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                  Change image
                </label>
              </div>
            ) : (
              <div className="flex h-[188px] flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed border-ink-border bg-ink-surface-2 text-center">
                <ImagePlus size={27} strokeWidth={1.5} aria-hidden="true" className="text-ink-text-2" />
                <p className="text-sm font-semibold text-ink-text">Add a cover image</p>
                <p className="font-mono text-[10px] text-ink-muted">
                  Large images are resized before upload
                </p>
                <label
                  htmlFor="post-cover"
                  className="mt-1 inline-flex h-[34px] cursor-pointer items-center rounded-[3px] border border-ink-border bg-ink-surface px-3 text-[13px] font-semibold text-ink-text hover:border-ink-border-strong"
                >
                  Upload Image
                </label>
              </div>
            )}
            {errors.image && (
              <p className="mt-2 text-xs text-ink-error">Featured image is required</p>
            )}
          </div>

          {/* Content */}
          <div className="ink-editor border-t border-ink-border">
            <RTE
              name="content"
              control={control}
              defaultValue={getValues("content")}
            />
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-ink-border px-6 py-4 font-mono text-[10px] text-ink-muted">
            <p>SAVED WHEN YOU PUBLISH OR SAVE A DRAFT</p>
            <p className="shrink-0 tabular-nums">
              {words} word{words === 1 ? "" : "s"} · {minutes} min read
            </p>
          </div>
        </div>

        {/* ======================================
            POST SETTINGS
        ====================================== */}
        <div className="overflow-hidden rounded-[6px] border border-ink-border bg-ink-surface xl:sticky xl:top-28">
          <div className="flex items-center gap-2.5 border-b border-ink-border p-6">
            <SlidersHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
            <h2 className="text-[17px] font-bold text-ink-text">Post Settings</h2>
          </div>

          <div className="flex flex-col gap-6 p-6">
            {/* Category — required for new posts. A post from before
                categories existed may stay uncategorised until its author
                picks one. */}
            <fieldset>
              <legend className="mb-3 flex w-full items-center justify-between font-mono text-[10px]">
                <span className="text-ink-text-2">CATEGORY</span>
                <span className="text-ink-muted">{post ? "pick 1" : "required"}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((item) => (
                  <label key={item.key} className="cursor-pointer">
                    <input
                      type="radio"
                      value={item.key}
                      className="peer sr-only"
                      {...register("category", {
                        validate: (value) =>
                          Boolean(post) || Boolean(value) || "Choose a category",
                      })}
                    />
                    <span className="inline-flex items-center rounded-[4px] border border-ink-border bg-ink-bg px-2.5 py-1.5 text-[11px] text-ink-text-2 transition-colors peer-checked:border-ink-sage peer-checked:bg-ink-sage peer-checked:font-semibold peer-checked:text-ink-on-sage peer-focus-visible:border-ink-border-strong hover:border-ink-border-strong">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.category ? (
                <p className="mt-2 text-xs text-ink-error">{errors.category.message}</p>
              ) : (
                post &&
                !post.category && (
                  <p className="mt-2 text-xs text-ink-muted">
                    This post has no category yet. Choosing one is optional.
                  </p>
                )
              )}
            </fieldset>

            <div className="h-px bg-ink-border" />

            {/* Author */}
            <div>
              <Input
                label="Author"
                placeholder="Author name"
                {...register("author", {
                  required: "Author is required",
                  validate: notBlank("Author"),
                })}
              />
              {errors.author && (
                <p className="mt-1.5 text-xs text-ink-error">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-ink-border p-6">
            {submitError && (
              <p
                role="alert"
                className="rounded-[3px] border border-ink-error/50 px-3 py-2 text-sm text-ink-error"
              >
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[4px] border border-ink-border-strong bg-ink-primary px-4 text-[13px] font-semibold text-ink-on-primary disabled:opacity-60"
            >
              <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              {isSubmitting ? "Saving…" : `${publishLabel} Post`}
            </button>
            <p className="text-[10px] leading-[1.5] text-ink-muted">
              Your story will be visible to everyone. Use {draftLabel} to keep
              it private.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Postform;
