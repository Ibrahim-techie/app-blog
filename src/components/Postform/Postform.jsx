import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import postservice from "../../services/Post.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import fileservice from "../../services/storage.service";

function Postform({ post }) {
    const userData = useSelector((state) => state.auth.userData);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
      slug: post?.$id || "",
      status: post?.status || "active",
      author: post?.author || userData?.name || "",
    },
  });

  const navigate = useNavigate();


  // --------------------------------
  // Convert title into URL-friendly slug
  // --------------------------------
  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    return "";
  }, []);

  // --------------------------------
  // Automatically generate slug
  // --------------------------------
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // --------------------------------
  // Submit
  // --------------------------------
  const submit = async (data) => {
    console.log(data);
    
    try {
      // ==============================
      // UPDATE EXISTING POST
      // ==============================
      if (post) {
        const oldImageId = post.featuredImage;

        // Upload new image only if selected
        const file = data.image?.[0]
          ? await fileservice.fileUpload(data.image[0])
          : null;

        const updatePost = await postservice.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : oldImageId,
        });

        if (updatePost) {
          // Delete old image only after successful update
          if (file && oldImageId) {
            await fileservice.fileDelete(oldImageId);
          }

          navigate(`/post/${updatePost.$id}`);
        } else {
          // Update failed → clean up newly uploaded image
          if (file) {
            await fileservice.fileDelete(file.$id);
          }

          console.error("Failed to update post");
        }

        return;
      }

      // ==============================
      // CREATE NEW POST
      // ==============================

      if (!data.image?.[0]) {
        console.error("Featured image is required");
        return;
      }

      const file = await fileservice.fileUpload(data.image[0]);

      if (!file) {
        console.error("Failed to upload image");
        return;
      }

      const createPost = await postservice.createPost({
        ...data,

        featuredImage: file.$id,
        userID: userData.$id,
      });

      if (createPost) {
        navigate(`/post/${createPost.$id}`);
      } else {
        // Post creation failed → remove uploaded image
        await fileservice.fileDelete(file.$id);
        console.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
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
                })}
              />

              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
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
                onClick={() => navigate(`/post/${post.$id}`)}
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
