"use client";

import parse, { DOMNode, Element, Text } from "html-react-parser";
import { TranslatableText } from "@/components/shared/translatable-text";

interface TranslatableHtmlProps {
  content: string; // The raw HTML string
  className?: string;
}

export function TranslatableHtml({ content, className }: TranslatableHtmlProps) {
  
  // Configuration for the parser
  const options = {
    replace: (domNode: DOMNode) => {
      // 1. Check if the node is a Text node
      if (domNode.type === "text") {
        const textNode = domNode as Text;
        const textValue = textNode.data;

        // 2. If text is empty or just whitespace, ignore it
        if (!textValue || !textValue.trim()) {
          return;
        }

        // 3. Wrap meaningful text in our Translator Component
        return <TranslatableText text={textValue} />;
      }
    },
  };

  return (
    <div className={className}>
      {/* Parse the HTML string into React Components with our overrides */}
      {parse(content, options)}
    </div>
  );
}