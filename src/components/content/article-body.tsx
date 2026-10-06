/**
 * The text of an article, shown as staff typed it: plain text with their
 * paragraphs and line breaks kept. It is never treated as HTML, so nothing
 * typed into the editor can inject markup into the page.
 */
export function ArticleBody({ text }: { text: string }) {
  return (
    <div className="text-foreground text-base sm:text-lg leading-relaxed whitespace-pre-line">
      {text}
    </div>
  )
}
