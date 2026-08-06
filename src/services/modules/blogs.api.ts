import { apiFetch } from "@/hooks/interceptor";
import { BlogReactionType } from "@/types/enums";
import { IBlog } from "@/types/interface";

export const createBlog = async (blog: Partial<IBlog>) => {
    const response = await apiFetch<any>("blogs", {
        method: "POST",
        body: blog,
        auth: true
    })
    return response.data;
}

export const getBlogs = async (searchParams: any) => {
    const response = await apiFetch<any>(`blogs?${new URLSearchParams(searchParams).toString()}`, {
        method: "GET",
        auth: true
    })
    return response.data;
}


export const getBlogsListAdmin = async (searchParams: any) => {
    const response = await apiFetch<any>(`blogs/admin?${new URLSearchParams(searchParams).toString()}`, {
        method: "GET",
        auth: true
    })
    return response.data;
}

export const getBlogBySlug = async (slug: string) => {
    const response = await apiFetch<any>(`blogs/${slug}`, {
        method: "GET",
        auth: true
    })
    return response.data;
}

export const addBlogReaction = async (slug: string, reaction: BlogReactionType) => {
    const response = await apiFetch<any>(`blogs/reaction`, {
        method: "POST",
        body: { slug, type:reaction },
        auth: true
    })
    return response.data.reactions;
}

export const updateBlog = async (slug: string, blog: Partial<IBlog>) => {
    const response = await apiFetch<any>(`blogs/${slug}`, {
        method: "PUT",
        body: blog,
        auth: true
    })
    return response.data;
}

export const deleteBlog = async (slug: string) => {
    const response = await apiFetch<any>(`blogs/${slug}`, {
        method: "DELETE",
        auth: true
    })
    return response.data;
}
