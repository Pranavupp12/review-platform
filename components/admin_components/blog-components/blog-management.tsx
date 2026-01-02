"use client";

import { useState, useEffect } from "react";
import { createBlog, deleteBlog } from "@/lib/blog-actions";
import { RichTextEditor } from "@/components/admin_components/blog-components/rich-text-editor";
import SimpleImageUpload from "@/components/admin_components/blog-components/simple-image-upload";
import { BlogFilters } from "@/components/admin_components/blog-components/blog-filters"; // ✅ Import Filters
import { PaginationControls } from "@/components/shared/pagination-controls"; // ✅ Import Pagination
import { EditBlogModal } from "./edit-blog-modal";
import { DeleteBlogModal } from "./delete-blog-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2, Link as LinkIcon, UploadCloud, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { LinkListModal } from "./link-list-modal";

interface BlogManagementProps {
    initialBlogs: any[];
    uniqueCategories: string[];
    companyCategories: { id: string; name: string }[];
    cityOptions: string[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

// --- Helper Function for Slug ---
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/-+$/, '');
}

export function BlogManagement({
    initialBlogs,
    uniqueCategories,
    companyCategories,
    cityOptions,
    totalCount,
    currentPage,
    pageSize
}: BlogManagementProps) {

    // We update blogs when initialBlogs changes (due to pagination/filter)
    const [blogs, setBlogs] = useState(initialBlogs);
    const router = useRouter();

    useEffect(() => {
        setBlogs(initialBlogs);
    }, [initialBlogs]);

    // Form States
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [slug, setSlug] = useState("");
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [imageMethod, setImageMethod] = useState<'upload' | 'url'>('upload');

    // --- FORM HANDLERS (Unchanged from your code) ---
    const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHeadline = e.target.value;
        if (!isSlugManuallyEdited) {
            setSlug(generateSlug(newHeadline));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setIsSlugManuallyEdited(true);
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        if (imageUrl) formData.append("imageUrl", imageUrl);
        formData.set("blogUrl", slug);

        const res = await createBlog(formData, content);

        if (res.success) {
            toast.success("Blog published successfully!");
            setContent("");
            setImageUrl("");
            setSlug("");
            setIsSlugManuallyEdited(false);
            setImageMethod('upload');
            (document.getElementById("create-blog-form") as HTMLFormElement).reset();
            router.refresh(); // Refresh to see new blog in list
        } else {
            toast.error(res.error || "Failed to publish");
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        const res = await deleteBlog(id);
        if (res.success) {
            toast.success("Blog deleted");
            // Optimistic update
            setBlogs(blogs.filter(b => b.id !== id));
            router.refresh(); // Sync with server
        } else {
            toast.error("Failed to delete");
        }
    }

    return (
        <div className="space-y-12">

            {/* --- 1. CREATE FORM (Collapsible or just standard) --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="create-blog-form" action={handleSubmit} className="space-y-6">
                        {/* ... (Keep your existing Form JSX exactly as it was) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="headline">Headline</Label>
                                <Input id="headline" name="headline" placeholder="Enter blog title" required onChange={handleHeadlineChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="blogUrl">Blog Slug (URL)</Label>
                                <Input id="blogUrl" name="blogUrl" value={slug} onChange={handleSlugChange} placeholder="auto-generated-slug" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" placeholder="e.g. Technology" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="authorName">Author Name</Label>
                                <Input id="authorName" name="authorName" placeholder="e.g. Admin Team" required />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="mb-2 block">Cover Image</Label>
                                <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as 'upload' | 'url')} className="w-full">
                                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-4">
                                        <TabsTrigger value="upload" className="flex gap-2"><UploadCloud className="w-4 h-4" /> Upload File</TabsTrigger>
                                        <TabsTrigger value="url" className="flex gap-2"><LinkIcon className="w-4 h-4" /> Paste URL</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="mt-0">
                                        <SimpleImageUpload value={imageUrl} onChange={(url: string) => setImageUrl(url)} onRemove={() => setImageUrl("")} />
                                    </TabsContent>
                                    <TabsContent value="url" className="mt-0">
                                        <div className="flex gap-4 items-start">
                                            <Input placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                                            {imageUrl && <div className="h-10 w-16 relative rounded overflow-hidden border bg-gray-100 shrink-0"><img src={imageUrl} alt="Preview" className="object-cover w-full h-full" /></div>}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                                <input type="hidden" name="imageUrl" value={imageUrl} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Blog Content</Label>
                            <div className="border rounded-md"><RichTextEditor value={content} onChange={setContent} /></div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg space-y-4 border">
                            <h3 className="font-semibold text-sm text-gray-700">SEO Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="metaTitle">Meta Title</Label><Input id="metaTitle" name="metaTitle" required /></div>
                                <div className="space-y-2"><Label htmlFor="metaKeywords">Keywords</Label><Input id="metaKeywords" name="metaKeywords" placeholder="comma, separated, keys" required /></div>
                                <div className="space-y-2 md:col-span-2"><Label htmlFor="metaDescription">Meta Description</Label><Textarea id="metaDescription" name="metaDescription" required /></div>
                            </div>
                        </div>
                        <Button type="submit" className="w-full md:w-auto" disabled={loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish Blog"}</Button>
                    </form>
                </CardContent>
            </Card>

            {/* --- 2. LIST TABLE SECTION --- */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>All Blogs ({totalCount})</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>

                    {/* ✅ FILTERS */}
                    <BlogFilters uniqueCategories={uniqueCategories} />

                    <div className="rounded-md border border-gray-200 mt-4 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Image</TableHead>
                                    <TableHead>Headline</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Inbox className="h-10 w-10 mb-2" />
                                                <p>No blogs found matching your criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    blogs.map((blog) => (
                                        <TableRow key={blog.id}>
                                            <TableCell>
                                                {blog.imageUrl ? (
                                                    <div className="h-10 w-16 relative rounded overflow-hidden bg-gray-100">
                                                        <img src={blog.imageUrl} alt="" className="object-cover w-full h-full" />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-16 bg-gray-100 rounded"></div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{blog.headline}</span>
                                                    <span className="text-xs text-gray-400">/{blog.blogUrl}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {blog.category}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(blog.createdAt), "dd MMM, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <LinkListModal
                                                    blogId={blog.id}
                                                    currentCategoryId={blog.linkedCategoryId}
                                                    categoryOptions={companyCategories}
                                                    cityOptions={cityOptions}
                                                    currentCity={blog.linkedCity}
                                                />
                                                <EditBlogModal blog={blog} />
                                                <Button variant="outline" size="sm" asChild className="hover:bg-gray-100">
                                                    <a href={`/blog/${blog.blogUrl}`} target="_blank">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <DeleteBlogModal onConfirm={() => handleDelete(blog.id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ✅ PAGINATION CONTROLS */}
                    <div className="mt-6">
                        <PaginationControls
                            totalItems={totalCount}
                            pageSize={pageSize}
                            currentPage={currentPage}
                        />
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}