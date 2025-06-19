import styles from "@/styles/RichTextContent.module.css"

interface RichTextContentProps {
  content: string
  className?: string
}

export default function RichTextContent({ content, className = "" }: RichTextContentProps) {
  return <div className={`${styles.richContent} ${className}`} dangerouslySetInnerHTML={{ __html: content }} />
}
