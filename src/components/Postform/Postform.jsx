import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import postservice from "../../services/Post.service";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import fileservice from "../../services/storage.service";

function Postform({ post }) {
  // React Hook Form setup
  const { register, handleSubmit, control, watch, setValue, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        content: post?.content || "",
        slug: post?.$id || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // Form Submit

  const submit = async (data) => {
    // UPDATE EXISTING POST

    if (post) {
      // Keep the old image ID because we may need to
      // delete it after successfully updating the post.
      const oldImageId = post.featuredImage;

      // Upload a new image only if the user selected one.
      const file = data.image[0]
        ? await fileservice.fileUpload(data.image[0])
        : null;

      // Update the post with the new image if uploaded.
      // Otherwise, keep the existing image.
      const updatePost = await postservice.updatePost(post.$id, {
        ...data,
        featuredImage: file ? file.$id : oldImageId,
      });

      if (updatePost) {
        // Post was updated successfully.
        // Now it is safe to delete the old image.
        if (file) {
          await fileservice.fileDelete(oldImageId);
        }

        navigate(`/post/${updatePost.$id}`);
      } else {
        // Post update failed.
        // The new image is no longer needed, so delete it
        // to avoid leaving an unused file in storage.
        if (file) {
          await fileservice.fileDelete(file.$id);
        }
      }

      return;
    }

    // CREATE NEW POST

    // Image is required when creating a new post.
    const file = await fileservice.fileUpload(data.image[0]);

    if (file) {
      // Store the uploaded file ID as the post's featured image.
      data.featuredImage = file.$id;

      const createPost = await postservice.createPost({
        ...data,
        userID: userData.userID,
      });

      if (createPost) {
        navigate(`/post/${createPost.$id}`);
      }
    }
  };

  // Convert title/text into a URL-friendly slug

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }

    return "";
  }, []);

  // Automatically generate slug when title changes

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), {
          shouldValidate: true,
        });
      }
    });

    // Stop watching when the component unmounts.
    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      {/* ================= LEFT SECTION ================= */}
      <div>
        {/* Post Title */}
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", {
            required: "Title is Required",
          })}
        />

        {/* Post Slug */}
        <Input
          label="Slug"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", {
            required: true,
          })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.target.value), {
              shouldValidate: true,
            });
          }}
        />

        {/* Post Content */}
        <RTE
          label="Content"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      {/* ================= RIGHT SECTION ================= */}
      <div className="w-1/3 px-2">
        {/* Featured Image Upload */}
        <Input
          label="Featured Image:"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", {
            // Image is required only when creating a post.
            required: !post,
          })}
        />

        {/* Show existing image while editing */}
        {post && (
          <div className="w-full mb-4">
            <img
              src={fileservice.filePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Post Status */}
        <Select
          options={["active", "inactive"]}
          label="status"
          className="mb-4"
          {...register("status", {
            required: true,
          })}
        />

        {/* Submit / Update Button */}
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default Postform;
