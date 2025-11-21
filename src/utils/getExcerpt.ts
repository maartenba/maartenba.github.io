export default function getExcerpt(content: string, length: number) {
  const excerptParagraphs = [];
  let currentLength = 0;

  const paragraphs = content.match(/<p>.*?<\/p>/gs) || [];
  for (let _i = 0, paragraphs_1 = paragraphs; _i < paragraphs_1.length; _i++) {
    const paragraph = paragraphs_1[_i];
    // Strip HTML from the paragraph
    const text = paragraph?.replace(/(<([^>]+)>)/gi, "") ?? "";
    if (currentLength > 0 && currentLength + text.length > length) {
      break;
    }
    excerptParagraphs.push(text);
    currentLength += text.length;
  }

  return excerptParagraphs.join(" ").trim();
}
