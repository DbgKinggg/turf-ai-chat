"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type ResponseProps = ComponentProps<typeof Streamdown> & {
  children?: string;
};

// Clean function call XML tags from AI responses
function cleanResponseText(text: string): string {
  if (typeof text !== 'string') return text;

  return text
    // Remove function call blocks completely
    .replace(/<function_calls>[\s\S]*?<\/antml:function_calls>/g, '')
    // Remove individual invoke blocks (both forms)
    .replace(/<invoke[^>]*>[\s\S]*?<\/antml:invoke>/g, '')
    .replace(/<invoke[^>]*>[\s\S]*?<\/invoke>/g, '')
    // Remove parameter tags (both forms)
    .replace(/<parameter[^>]*>[\s\S]*?<\/antml:parameter>/g, '')
    .replace(/<parameter[^>]*>[\s\S]*?<\/parameter>/g, '')
    // Remove any remaining tags
    .replace(/<\/?(?:antml:)?(?:invoke|parameter|function_calls)[^>]*>/g, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => {
    const cleanedChildren = typeof children === 'string'
      ? cleanResponseText(children)
      : children;

    return (
      <Streamdown
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        {...props}
      >
        {cleanedChildren}
      </Streamdown>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
