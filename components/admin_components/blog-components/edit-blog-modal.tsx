"use client";

import { useState } from "react";
import { updateBlog } from "@/lib/blog-actions";
import { RichTextEditor } from "@/components/admin_components/blog-components/rich-text-editor";
import SimpleImageUpload from "@/components/admin_components/blog-components/simple-image-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, UploadCloud, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EditBlogModalProps {
  blog: any; // The blog object to edit
}

export function EditBlogModal({ blog }: EditBlogModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(blog.content);
  const [imageUrl, setImageUrl] = useState(blog.imageUrl || "");
  const [imageMethod, setImageMethod] = useState<'upload' | 'url'>('upload');

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    
    // Append manual fields
    if (imageUrl) formData.append("imageUrl", imageUrl);
    
    const res = await updateBlog(blog.id, formData, content);

    if (res.success) {
      toast.success("Blog updated successfully");
      setOpen(false);
      window.location.reload(); 
    } else {
      toast.error(res.error || "Update failed");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:bg-gray-100">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-11/12 max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Blog</DialogTitle>
        </DialogHeader>

        <form action={handleUpdate} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" name="headline" defaultValue={blog.headline} required />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="blogUrl">Blog Slug</Label>
                    <Input id="blogUrl" name="blogUrl" defaultValue={blog.blogUrl} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" defaultValue={blog.category} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input id="authorName" name="authorName" defaultValue={blog.authorName} required />
                </div>
                
                {/* Image Section */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="mb-2 block">Cover Image</Label>
                    <Tabs value={imageMethod} onValueChange={(v) => setImageMethod(v as 'upload' | 'url')} className="w-full">
                        <TabsList className="mb-2">
                            <TabsTrigger value="upload"><UploadCloud className="w-4 h-4 mr-2"/> Upload</TabsTrigger>
                            <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-2"/> URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload">
                            <SimpleImageUpload value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} />
                        </TabsContent>
                        <TabsContent value="url">
                            <div className="flex gap-4 items-start">
                                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                                {imageUrl && <img src={imageUrl} className="h-10 w-16 object-cover rounded border" />}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Content</Label>
                <div className="border rounded-md">
                    <RichTextEditor value={content} onChange={setContent} />
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border">
                <h3 className="font-semibold text-sm">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input name="metaTitle" defaultValue={blog.metaTitle} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Keywords</Label>
                        <Input name="metaKeywords" defaultValue={blog.metaKeywords} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Meta Description</Label>
                        <Textarea name="metaDescription" defaultValue={blog.metaDescription} required />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" className="hover:bg-gray-100" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : "Save Changes"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}