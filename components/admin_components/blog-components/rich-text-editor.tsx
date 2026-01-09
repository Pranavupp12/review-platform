'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Link, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered,
  ImageIcon // Icon for the image button
} from 'lucide-react';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image'; 
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
// Import the server action we created
import { uploadEditorImage } from '@/lib/blog-actions';

// --- Custom Toolbar ---
const MenuBar = ({ editor, addImage }: { editor: Editor | null, addImage: () => void }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-t-md p-2 flex flex-wrap gap-2 sticky top-0 bg-background z-10 border-b-0">
      {/* --- Heading Buttons --- */}
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'} size="sm">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'} size="sm">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'} size="sm">
        <Heading3 className="h-4 w-4" />
      </Button>

      {/* --- Style Buttons --- */}
      <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'default' : 'outline'} size="sm">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'default' : 'outline'} size="sm">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'default' : 'outline'} size="sm">
        <Underline className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={setLink} variant={editor.isActive('link') ? 'default' : 'outline'} size="sm">
        <Link className="h-4 w-4" />
      </Button>

      {/* --- Image Upload Button --- */}
      <Button type="button" onClick={addImage} variant="outline" size="sm" title="Upload Image">
        <ImageIcon className="h-4 w-4" />
      </Button>

      {/* --- Align Buttons --- */}
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'} size="sm">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'} size="sm">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'} size="sm">
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'} size="sm">
        <AlignJustify className="h-4 w-4" />
      </Button>

      {/* --- List Buttons --- */}
      <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'default' : 'outline'} size="sm">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'default' : 'outline'} size="sm">
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};

// --- Main Editor Component ---
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function RichTextEditor({ value, onChange, onBlur }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'], 
      }),
      ImageExtension.configure({
        inline: true,
        allowBase64: false, // Uploads to Cloudinary, so no base64
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    onBlur() {
      if(onBlur) onBlur();
    },
    editorProps: {
      attributes: {
        // Tailwind classes for the editor content area
        class: 'prose dark:prose-invert min-h-[400px] w-full max-w-none rounded-b-md border p-4 focus:outline-none [&_img]:rounded-md [&_img]:w-full [&_img]:object-cover [&_img]:mx-auto [&_img]:my-4',
      },
    },
    immediatelyRender: false,
  });

  // --- Image Upload Logic ---
  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const altText = window.prompt('Set Alt Text description for this image:', file.name.split('.')[0]);
        if (altText === null) return; // Cancelled

        const toastId = toast.loading('Uploading image...');
        
        try {
          const formData = new FormData();
          formData.append('file', file);

          const result = await uploadEditorImage(formData);

          if (result.success && result.url) {
            editor?.chain().focus().setImage({ 
              src: result.url,
              alt: altText 
            }).run();
            
            toast.success('Image uploaded successfully', { id: toastId });
          } else {
            toast.error(result.error || 'Failed to upload image', { id: toastId });
          }
        } catch (error) {
          console.error(error);
          toast.error('Something went wrong during upload', { id: toastId });
        }
      }
    };
    
    input.click();
  }, [editor]);

  // Sync external value changes to editor content
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Only set content if editor is empty or on initial load to prevent cursor jumping
      if (value && editor.isEmpty) {
         editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col flex-grow">
      <MenuBar editor={editor} addImage={addImage} />
      <EditorContent editor={editor} className="flex-grow flex flex-col" />
    </div>
  );
}