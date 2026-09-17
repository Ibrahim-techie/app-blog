import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import postservice from "../../services/Post.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import fileservice from "../../services/storage.service";
import { postPath, slugify } from "../../utils/postUrl";

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
    },
  });

  // Live preview of the readable part of the URL.
  const title = useWatch({ control, name: "title" });

  const submit = async (data) => {
    setSubmitError("");

    // An image we uploaded that no saved post points to yet. If anything
    // fails before the save succeeds, it gets deleted so storage stays clean.
    let orphanImageId = null;

    try {
      let imageId = post?.featuredImage;

      if (data.image?.[0]) {
        const file = await fileservice.fileUpload(data.image[0]);
        if (!file) {
          throw new Error("We couldn't upload your image. Please try again.");
        }
        imageId = file.$id;
        orphanImageId = file.$id;
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
      navigate(postPath(saved));
    } catch (error) {
      if (orphanImageId) await fileservice.fileDelete(orphanImageId);
      setSubmitError(
        error?.message || "Something went wrong while saving. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ======================================
            LEFT / MAIN EDITOR
        ====================================== */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Section Heading */}
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                {post ? "Edit Content" : "Create Content"}
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                {post ? "Edit your post" : "Create a new post"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {post
                  ? "Make changes to your post and publish the updated version."
                  : "Write something interesting and share it with your audience."}
              </p>
            </div>

            {/* Title */}
            <div className="mb-6">
              <Input
                label="Title"
                placeholder="Enter your post title"
                className="mb-1"
                {...register("title", {
                  required: "Title is required",
                  validate: notBlank("Title"),
                })}
              />

              {errors.title ? (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              ) : (
                <p className="mt-1 truncate pl-1 text-xs text-gray-400">
                  URL: /post/
                  <span className="font-medium text-gray-600">
                    {slugify(title)}
                  </span>
                  /{post ? post.$id : "…"}
                </p>
              )}
            </div>

            {/* Author */}
            <div className="mb-6">
              <Input
                label="Author"
                placeholder="Author-Name"
                {...register("author", {
                  required: "Author is required",
                  validate: notBlank("Author"),
                })}
              />

              {errors.author && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.author.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <RTE
                label="Content"
                name="content"
                control={control}
                defaultValue={getValues("content")}
              />
            </div>
          </div>
        </div>

        {/* ======================================
            RIGHT / PUBLISHING SIDEBAR
        ====================================== */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Sidebar Heading */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Publish</h3>

              <p className="mt-1 text-sm text-gray-500">
                Configure your post before publishing.
              </p>
            </div>

            {/* Featured Image */}
            <div className="mb-6">
              <Input
                label="Featured Image"
                type="file"
                accept="image/png, image/jpg, image/jpeg, image/gif"
                {...register("image", {
                  required: !post ? "Featured image is required" : false,
                })}
              />

              {errors.image && (
                <p className="mt-2 text-sm text-red-500">
                  Featured image is required
                </p>
              )}
            </div>

            {/* Existing Image */}
            {post?.featuredImage && (
              <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={fileservice.filePreview(post.featuredImage)}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />

                <p className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                  Current featured image
                </p>
              </div>
            )}

            {/* Status */}
            <div className="mb-6">
              <Select
                options={["active", "inactive"]}
                label="Status"
                {...register("status", {
                  required: true,
                })}
              />
            </div>

            {/* Divider */}
            <div className="mb-6 h-px bg-gray-200" />

            {submitError && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              bgColor={post ? "bg-green-500" : "bg-indigo-600"}
              className="w-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : post
                  ? "Update Post"
                  : "Publish Post"}
            </Button>

            {/* Cancel */}
            {post && (
              <button
                type="button"
                onClick={() => navigate(postPath(post))}
                className="mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export default Postform;
